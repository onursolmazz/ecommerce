<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = max(
            1,
            min((int) $request->input('per_page', 10), 50)
        );

        $query = Order::query()
            ->with([
                'items.product.images',
                'items.product.category',
                'user',
            ]);

        if (!$this->isAdmin()) {
            $query->where('user_id', Auth::id());
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $orders = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Siparişler getirildi.',
            'data' => OrderResource::collection(
                $orders->getCollection()
            ),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'from' => $orders->firstItem(),
                'to' => $orders->lastItem(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_name' => [
                'required',
                'string',
                'min:3',
                'max:150',
            ],
            'shipping_phone' => [
                'required',
                'string',
                'min:10',
                'max:30',
            ],
            'shipping_city' => [
                'required',
                'string',
                'max:100',
            ],
            'shipping_district' => [
                'required',
                'string',
                'max:100',
            ],
            'shipping_address' => [
                'required',
                'string',
                'min:10',
                'max:2000',
            ],
            'shipping_note' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'payment_method' => [
                'required',
                'string',
                Rule::in([
                    'cash_on_delivery',
                    'credit_card',
                ]),
            ],
        ]);

        try {
            $order = DB::transaction(function () use ($validated) {
                $cart = Cart::query()
                    ->with('items')
                    ->where('user_id', Auth::id())
                    ->lockForUpdate()
                    ->first();

                if (!$cart || $cart->items->isEmpty()) {
                    abort(422, 'Sepet boş.');
                }

                $total = 0;
                $preparedItems = [];

                foreach ($cart->items as $cartItem) {
                    $product = Product::query()
                        ->where('status', true)
                        ->lockForUpdate()
                        ->find($cartItem->product_id);

                    if (!$product) {
                        abort(
                            422,
                            'Sepetteki ürünlerden biri artık satışta değil.'
                        );
                    }

                    $quantity = (int) $cartItem->quantity;

                    if ($quantity < 1) {
                        abort(
                            422,
                            "{$product->name} için geçersiz ürün adedi."
                        );
                    }

                    if ((int) $product->stock < $quantity) {
                        abort(
                            422,
                            "{$product->name} için yeterli stok bulunmuyor."
                        );
                    }

                    $price = (float) $product->price;

                    $total += $price * $quantity;

                    $preparedItems[] = [
                        'product' => $product,
                        'quantity' => $quantity,
                        'price' => $price,
                    ];
                }

                $paymentStatus =
                    $validated['payment_method'] === 'credit_card'
                    ? 'pending'
                    : 'pending';

                $order = Order::create([
                    'user_id' => Auth::id(),
                    'shipping_name' => $validated['shipping_name'],
                    'shipping_phone' => $validated['shipping_phone'],
                    'shipping_city' => $validated['shipping_city'],
                    'shipping_district' => $validated['shipping_district'],
                    'shipping_address' => $validated['shipping_address'],
                    'shipping_note' => $validated['shipping_note'] ?? null,
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => $paymentStatus,
                    'total_price' => $total,
                    'status' => 'pending',
                ]);

                foreach ($preparedItems as $preparedItem) {
                    $product = $preparedItem['product'];
                    $quantity = $preparedItem['quantity'];
                    $price = $preparedItem['price'];

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'price' => $price,
                    ]);

                    $product->decrement('stock', $quantity);

                    if (
                        array_key_exists(
                            'sales_count',
                            $product->getAttributes()
                        )
                    ) {
                        $product->increment(
                            'sales_count',
                            $quantity
                        );
                    }

                    StockHistory::create([
                        'product_id' => $product->id,
                        'user_id' => Auth::id(),
                        'type' => 'sale',
                        'quantity' => -$quantity,
                        'description' =>
                        "Sipariş #{$order->id} oluşturuldu.",
                    ]);
                }

                Notification::create([
                    'user_id' => Auth::id(),
                    'title' => 'Sipariş oluşturuldu',
                    'message' =>
                    "Siparişiniz başarıyla oluşturuldu. Sipariş numarası: #{$order->id}",
                    'type' => 'order',
                    'is_read' => false,
                ]);

                $cart->items()->delete();

                return $order;
            });

            $order->load([
                'user',
                'items.product.images',
                'items.product.category',
                'items.product.seller',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sipariş başarıyla oluşturuldu.',
                'data' => new OrderResource($order),
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            $status = $this->getExceptionStatus($exception);

            return response()->json([
                'success' => false,
                'message' => in_array(
                    $status,
                    [403, 404, 422],
                    true
                )
                    ? $exception->getMessage()
                    : 'Sipariş oluşturulamadı.',
                'error' =>
                app()->isLocal() && $status === 500
                    ? $exception->getMessage()
                    : null,
            ], $status);
        }
    }

    public function show(Order $order): JsonResponse
    {
        $this->ensureOrderAccess($order);

        $order->load([
            'items.product.images',
            'items.product.category',
            'user',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sipariş getirildi.',
            'data' => new OrderResource($order),
        ]);
    }

    public function updateStatus(
        Request $request,
        Order $order
    ): JsonResponse {
        abort_unless(
            $this->isAdmin(),
            403,
            'Sipariş durumunu değiştirme yetkiniz yok.'
        );

        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in([
                    'pending',
                    'confirmed',
                    'preparing',
                    'shipped',
                    'delivered',
                    'cancelled',
                ]),
            ],
        ]);

        $previousStatus = $order->status;
        $newStatus = $validated['status'];

        if ($previousStatus === $newStatus) {
            return response()->json([
                'success' => true,
                'message' => 'Sipariş durumu zaten güncel.',
                'data' => new OrderResource($order),
            ]);
        }

        try {
            DB::transaction(function () use (
                $order,
                $previousStatus,
                $newStatus
            ) {
                $order->update([
                    'status' => $newStatus,
                ]);

                if (
                    $newStatus === 'cancelled' &&
                    $previousStatus !== 'cancelled'
                ) {
                    $order->load('items');

                    foreach ($order->items as $item) {
                        $product = Product::query()
                            ->lockForUpdate()
                            ->find($item->product_id);

                        if (!$product) {
                            continue;
                        }

                        $product->increment(
                            'stock',
                            (int) $item->quantity
                        );

                        if (
                            array_key_exists(
                                'sales_count',
                                $product->getAttributes()
                            )
                        ) {
                            $product->decrement(
                                'sales_count',
                                min(
                                    (int) $item->quantity,
                                    (int) $product->sales_count
                                )
                            );
                        }

                        StockHistory::create([
                            'product_id' => $product->id,
                            'user_id' => Auth::id(),
                            'type' => 'cancel',
                            'quantity' => (int) $item->quantity,
                            'description' => "Sipariş #{$order->id} iptal edildi.",
                        ]);
                    }
                }

                Notification::create([
                    'user_id' => $order->user_id,
                    'title' => 'Sipariş durumu güncellendi',
                    'message' => "Sipariş #{$order->id} durumu {$newStatus} olarak güncellendi.",
                    'type' => 'order',
                ]);
            });

            $order->refresh()->load([
                'user',
                'items.product.images',
                'items.product.category',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sipariş durumu güncellendi.',
                'data' => new OrderResource($order),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Sipariş durumu güncellenemedi.',
                'error' => app()->isLocal()
                    ? $exception->getMessage()
                    : null,
            ], 500);
        }
    }

    public function destroy(Order $order): JsonResponse
    {
        $this->ensureOrderAccess($order);

        if (
            !$this->isAdmin() &&
            !in_array(
                $order->status,
                ['pending', 'cancelled'],
                true
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Bu durumdaki sipariş silinemez.',
            ], 422);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sipariş silindi.',
            'data' => [
                'id' => $order->id,
                'deleted_at' => $order->deleted_at,
            ],
        ]);
    }

    private function ensureOrderAccess(Order $order): void
    {
        abort_unless(
            $this->isAdmin() ||
                (int) $order->user_id === (int) Auth::id(),
            403,
            'Bu sipariş üzerinde işlem yetkiniz yok.'
        );
    }

    private function isAdmin(): bool
    {
        $user = Auth::user();

        if (!$user) {
            return false;
        }

        return
            $user->role?->name === 'admin' ||
            $user->role?->slug === 'admin';
    }

    private function getExceptionStatus(
        Throwable $exception
    ): int {
        if ($exception instanceof HttpExceptionInterface) {
            return $exception->getStatusCode();
        }

        return 500;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class CartController extends Controller
{
    public function index(): JsonResponse
    {
        $userId = Auth::id();

        $cart = Cart::firstOrCreate([
            'user_id' => $userId,
        ]);

        $cart->load([
            'items.product.images',
            'items.product.category',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sepet başarıyla getirildi.',
            'data' => $cart,
            'meta' => [
                'items_count' => $cart->items->sum('quantity'),
                'unique_items_count' => $cart->items->count(),
                'subtotal' => $cart->items->sum(function ($item) {
                    if (!$item->product) {
                        return 0;
                    }

                    return (float) $item->product->price *
                        (int) $item->quantity;
                }),
            ],
        ]);
    }

    public function add(AddToCartRequest $request): JsonResponse
    {
        try {
            $cartItem = DB::transaction(function () use ($request) {
                $quantity = $request->integer('quantity');

                $product = Product::query()
                    ->where('status', true)
                    ->lockForUpdate()
                    ->findOrFail(
                        $request->integer('product_id')
                    );

                if ($quantity < 1) {
                    abort(422, 'Ürün adedi en az 1 olmalıdır.');
                }

                if ($product->stock <= 0) {
                    abort(422, 'Ürün stokta bulunmuyor.');
                }

                $cart = Cart::firstOrCreate([
                    'user_id' => Auth::id(),
                ]);

                $cartItem = CartItem::query()
                    ->where('cart_id', $cart->id)
                    ->where('product_id', $product->id)
                    ->lockForUpdate()
                    ->first();

                $newQuantity = $quantity;

                if ($cartItem) {
                    $newQuantity += (int) $cartItem->quantity;
                }

                if ($newQuantity > $product->stock) {
                    abort(
                        422,
                        "En fazla {$product->stock} adet ekleyebilirsiniz."
                    );
                }

                if ($cartItem) {
                    $cartItem->update([
                        'quantity' => $newQuantity,
                    ]);
                } else {
                    $cartItem = CartItem::create([
                        'cart_id' => $cart->id,
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                    ]);
                }

                return $cartItem;
            });

            $cartItem->load([
                'product.images',
                'product.category',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ürün sepete eklendi.',
                'data' => $cartItem,
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            $status = $this->getExceptionStatus($exception);

            return response()->json([
                'success' => false,
                'message' => $status === 422
                    ? $exception->getMessage()
                    : 'Ürün sepete eklenemedi.',
                'error' => app()->isLocal() && $status === 500
                    ? $exception->getMessage()
                    : null,
            ], $status);
        }
    }

    public function update(
        UpdateCartItemRequest $request,
        CartItem $cartItem
    ): JsonResponse {
        $this->ensureCartItemOwnership($cartItem);

        try {
            DB::transaction(function () use ($request, $cartItem) {
                $quantity = $request->integer('quantity');

                if ($quantity < 1) {
                    abort(422, 'Ürün adedi en az 1 olmalıdır.');
                }

                $product = Product::query()
                    ->lockForUpdate()
                    ->findOrFail($cartItem->product_id);

                if (!$product->status) {
                    abort(422, 'Bu ürün satışa kapalıdır.');
                }

                if ($product->stock <= 0) {
                    abort(422, 'Ürün stokta bulunmuyor.');
                }

                if ($quantity > $product->stock) {
                    abort(
                        422,
                        "En fazla {$product->stock} adet seçebilirsiniz."
                    );
                }

                $cartItem->update([
                    'quantity' => $quantity,
                ]);
            });

            $cartItem->refresh()->load([
                'product.images',
                'product.category',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sepet güncellendi.',
                'data' => $cartItem,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            $status = $this->getExceptionStatus($exception);

            return response()->json([
                'success' => false,
                'message' => $status === 422
                    ? $exception->getMessage()
                    : 'Sepet güncellenemedi.',
                'error' => app()->isLocal() && $status === 500
                    ? $exception->getMessage()
                    : null,
            ], $status);
        }
    }

    public function remove(CartItem $cartItem): JsonResponse
    {
        $this->ensureCartItemOwnership($cartItem);

        $cartItemId = $cartItem->id;
        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ürün sepetten kaldırıldı.',
            'data' => [
                'id' => $cartItemId,
            ],
        ]);
    }

    public function destroy(CartItem $cartItem): JsonResponse
    {
        return $this->remove($cartItem);
    }

    public function clear(): JsonResponse
    {
        $cart = Cart::query()
            ->where('user_id', Auth::id())
            ->first();

        if (!$cart) {
            return response()->json([
                'success' => true,
                'message' => 'Sepet zaten boş.',
            ]);
        }

        $cart->items()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sepet temizlendi.',
        ]);
    }

    private function ensureCartItemOwnership(
        CartItem $cartItem
    ): void {
        $belongsToUser = $cartItem
            ->cart()
            ->where('user_id', Auth::id())
            ->exists();

        abort_unless(
            $belongsToUser,
            403,
            'Bu sepet öğesi üzerinde işlem yetkiniz yok.'
        );
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

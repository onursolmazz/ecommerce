<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Notification;
use App\Models\StockHistory;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with([
            'items.product.images',
            'user'
        ])
            ->where('user_id', auth()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders)
        ]);
    }
    public function store()
    {
        DB::beginTransaction();

        try {

            $cart = Cart::with('items.product')
                ->where('user_id', auth()->id)
                ->firstOrFail();

            if ($cart->items->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sepet boş.'
                ], 422);
            }

            $total = 0;

            foreach ($cart->items as $item) {

                if ($item->product->stock < $item->quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => $item->product->name . ' stokta yok.'
                    ], 422);
                }

                $total += $item->product->price * $item->quantity;
            }

            $order = Order::create([
                'user_id' => auth()->id,
                'total_price' => $total,
                'status' => 'pending'
            ]);

            foreach ($cart->items as $item) {

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price
                ]);

                $item->product->decrement('stock', $item->quantity);

                $item->product->increment('sales_count', $item->quantity);

                StockHistory::create([
                    'product_id' => $item->product_id,
                    'user_id' => auth()->id,
                    'type' => 'sale',
                    'quantity' => -$item->quantity,
                    'description' => 'Sipariş oluşturuldu.'
                ]);
            }

            Notification::create([
                'user_id' => auth()->id,
                'title' => 'Sipariş',
                'message' => 'Siparişiniz başarıyla oluşturuldu.',
                'type' => 'order'
            ]);

            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sipariş oluşturuldu.',
                'data' => new OrderResource(
                    $order->load([
                        'user',
                        'items.product.images',
                        'items.product.category'
                    ])
                )
            ], 201);
        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Sipariş oluşturulamadı.',
                'error' => app()->isLocal() ? $e->getMessage() : null
            ], 500);
        }
    }
    public function show(Order $order)
    {
        $order->load([
            'items.product.images',
            'user'
        ]);

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order)
        ]);
    }
    public function updateStatus(Order $order)
    {
        $order->update([
            'status' => request('status')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sipariş durumu güncellendi.',
            'data' => new OrderResource($order)
        ]);
    }
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sipariş silindi.'
        ]);
    }
}

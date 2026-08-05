<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

class CartItemSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Cart::all() as $cart) {

            $products = Product::inRandomOrder()
                ->take(rand(1, 6))
                ->get();

            foreach ($products as $product) {

                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'quantity' => rand(1, 5),
                ]);
            }
        }
    }
}

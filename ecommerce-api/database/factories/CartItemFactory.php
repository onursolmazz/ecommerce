<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cart_id' => Cart::inRandomOrder()->value('id'),
            'product_id' => Product::inRandomOrder()->value('id'),
            'quantity' => fake()->numberBetween(1, 5),
        ];
    }
}

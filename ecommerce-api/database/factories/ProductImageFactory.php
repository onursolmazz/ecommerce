<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductImageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::inRandomOrder()->first()->id,
            'image' => 'products/' . fake()->uuid() . '.jpg',
            'is_primary' => false,
        ];
    }
}

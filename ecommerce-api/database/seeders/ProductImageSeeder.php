<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        Product::all()->each(function ($product) {

            $count = fake()->numberBetween(2, 5);
            for ($i = 1; $i <= $count; $i++) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => 'products/' . fake()->uuid() . '.jpg',
                    'is_primary' => $i === 1,
                ]);
            }
        });
    }
}

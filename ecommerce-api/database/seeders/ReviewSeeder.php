<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $created = [];

        while (count($created) < 500) {

            $user = User::where('role_id', 3)->inRandomOrder()->first();
            $product = Product::inRandomOrder()->first();

            $key = $user->id . '-' . $product->id;

            if (isset($created[$key])) {
                continue;
            }

            Review::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'rating' => rand(1, 5),
                'comment' => fake()->paragraph(),
            ]);

            $created[$key] = true;
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Favorite;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class FavoriteSeeder extends Seeder
{
    public function run(): void
    {
        $created = [];

        while (count($created) < 300) {

            $user = User::where('role_id', 3)->inRandomOrder()->first();
            $product = Product::inRandomOrder()->first();

            $key = $user->id . '-' . $product->id;

            if (isset($created[$key])) {
                continue;
            }

            Favorite::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);

            $created[$key] = true;
        }
    }
}

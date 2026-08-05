<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StockHistoryFactory extends Factory
{
    public function definition(): array
    {
        return [

            'product_id' => Product::inRandomOrder()->value('id'),

            'user_id' => User::where('role_id', 2)->inRandomOrder()->value('id'),

            'type' => fake()->randomElement([
                'in',
                'out'
            ]),

            'quantity' => rand(1, 100),

            'description' => fake()->sentence(),

        ];
    }
}

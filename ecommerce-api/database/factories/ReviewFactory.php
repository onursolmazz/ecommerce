<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::where('role_id', 3)->inRandomOrder()->first()->id,
            'product_id' => Product::inRandomOrder()->first()->id,
            'rating' => fake()->numberBetween(1, 5),
            'comment' => fake()->paragraph(),
        ];
    }
}

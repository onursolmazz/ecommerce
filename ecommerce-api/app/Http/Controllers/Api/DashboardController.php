<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Category;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'users_count' => User::count(),
                'products_count' => Product::count(),
                'orders_count' => Order::count(),
                'categories_count' => Category::count(),
                'total_sales' => Order::where('status', 'completed')
                    ->sum('total_price'),
                'latest_orders' => Order::with('user')
                    ->latest()
                    ->take(5)
                    ->get(),
                'latest_users' => User::latest()
                    ->take(5)
                    ->get(),
                'latest_products' => Product::latest()
                    ->take(5)
                    ->get(),
            ]

        ]);
    }
}
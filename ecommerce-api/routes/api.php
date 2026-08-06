<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])
        ->name('auth.register');

    Route::post('/login', [AuthController::class, 'login'])
        ->name('auth.login');
});

Route::get('/categories', [CategoryController::class, 'index'])
    ->name('categories.index');

Route::get('/categories/{category}', [CategoryController::class, 'show'])
    ->name('categories.show');

Route::get('/products', [ProductController::class, 'index'])
    ->name('products.index');

Route::get(
    '/products/{product:slug}/reviews',
    [ReviewController::class, 'index']
)->name('products.reviews.index');

Route::get(
    '/products/{product:slug}',
    [ProductController::class, 'show']
)->name('products.show');

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('auth.logout');

        Route::get('/me', [AuthController::class, 'me'])
            ->name('auth.me');

        Route::put(
            '/profile',
            [AuthController::class, 'updateProfile']
        )->name('auth.profile.update');

        Route::put(
            '/password',
            [AuthController::class, 'updatePassword']
        )->name('auth.password.update');
    });

    Route::prefix('categories')->group(function () {
        Route::post('/', [CategoryController::class, 'store'])
            ->name('categories.store');

        Route::put('/{category}', [CategoryController::class, 'update'])
            ->name('categories.update');

        Route::delete('/{category}', [CategoryController::class, 'destroy'])
            ->name('categories.destroy');

        Route::post(
            '/{category}/restore',
            [CategoryController::class, 'restore']
        )->name('categories.restore');

        Route::delete(
            '/{category}/force',
            [CategoryController::class, 'forceDelete']
        )->name('categories.force-delete');
    });

    Route::prefix('products')->group(function () {
        Route::post('/', [ProductController::class, 'store'])
            ->name('products.store');

        Route::put('/{product}', [ProductController::class, 'update'])
            ->name('products.update');

        Route::delete('/{product}', [ProductController::class, 'destroy'])
            ->name('products.destroy');

        Route::post(
            '/{product}/restore',
            [ProductController::class, 'restore']
        )->name('products.restore');

        Route::delete(
            '/{product}/force',
            [ProductController::class, 'forceDelete']
        )->name('products.force-delete');
    });

    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index'])
            ->name('cart.index');

        Route::post('/', [CartController::class, 'add'])
            ->name('cart.add');

        Route::put('/{cartItem}', [CartController::class, 'update'])
            ->name('cart.update');

        Route::delete('/{cartItem}', [CartController::class, 'remove'])
            ->name('cart.remove');

        Route::delete('/', [CartController::class, 'clear'])
            ->name('cart.clear');
    });

    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index'])
            ->name('orders.index');

        Route::post('/', [OrderController::class, 'store'])
            ->name('orders.store');

        Route::get('/{order}', [OrderController::class, 'show'])
            ->name('orders.show');

        Route::put('/{order}', [OrderController::class, 'update'])
            ->name('orders.update');

        Route::delete('/{order}', [OrderController::class, 'destroy'])
            ->name('orders.destroy');

        Route::patch(
            '/{order}/status',
            [OrderController::class, 'updateStatus']
        )->name('orders.update-status');
    });

    Route::prefix('favorites')->group(function () {
        Route::get('/', [FavoriteController::class, 'index'])
            ->name('favorites.index');

        Route::post('/', [FavoriteController::class, 'store'])
            ->name('favorites.store');

        Route::delete(
            '/{product}',
            [FavoriteController::class, 'destroy']
        )->name('favorites.destroy');
    });

    Route::prefix('reviews')->group(function () {
        Route::post('/', [ReviewController::class, 'store'])
            ->name('reviews.store');

        Route::put('/{review}', [ReviewController::class, 'update'])
            ->name('reviews.update');

        Route::delete('/{review}', [ReviewController::class, 'destroy'])
            ->name('reviews.destroy');
    });

    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])
            ->name('notifications.index');

        Route::patch(
            '/read-all',
            [NotificationController::class, 'readAll']
        )->name('notifications.read-all');

        Route::patch(
            '/{notification}/read',
            [NotificationController::class, 'read']
        )->name('notifications.read');

        Route::delete(
            '/{notification}',
            [NotificationController::class, 'destroy']
        )->name('notifications.destroy');
    });

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard.index');
});

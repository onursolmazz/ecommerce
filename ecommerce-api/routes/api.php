<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);

Route::apiResource('categories', CategoryController::class);
Route::post('categories/{category}/restore',[CategoryController::class, 'restore']);
Route::delete('categories/{category}/force',[CategoryController::class, 'forceDelete']);
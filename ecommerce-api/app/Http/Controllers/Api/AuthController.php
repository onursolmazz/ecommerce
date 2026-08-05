<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        return DB::transaction(function () use ($request) {

            $user = User::create([
                'role_id' => $request->role_id,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;


            return response()->json([
                'success' => true,
                'message' => 'Kullanıcı başarıyla oluşturuldu.',
                'token' => $token,
                'user' => new UserResource($user),
            ], 201);
        });
    }

    public function login(LoginRequest $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'E-posta veya şifre hatalı.'
            ], 401);
        }

        $user = $request->user();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Giriş başarılı.',
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Çıkış başarılı.'
        ]);
    }
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => new UserResource($request->user()),
        ]);
    }
}

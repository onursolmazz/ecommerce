<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'role_id' => ['required', 'exists:roles,id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email'
            ],

            'phone' => [
                'nullable',
                'string',
                'max:20'
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'role_id.required' => 'Yetki seçilmelidir.',
            'role_id.exists' => 'Geçersiz yetki seçildi.',
            'name.required' => 'Ad Soyad zorunludur.',
            'name.max' => 'Ad en fazla 255 karakter olabilir.',
            'email.required' => 'E-posta zorunludur.',
            'email.email' => 'Geçerli bir e-posta giriniz.',
            'email.unique' => 'Bu e-posta zaten kayıtlı.',
            'password.required' => 'Şifre zorunludur.',
            'password.min' => 'Şifre en az 8 karakter olmalıdır.',
            'password.confirmed' => 'Şifreler uyuşmuyor.',
        ];
    }

    public function attributes(): array
    {
        return [
            'role_id' => 'yetki',
            'name' => 'ad soyad',
            'email' => 'e-posta',
            'phone' => 'telefon',
            'password' => 'şifre',
        ];
    }
}

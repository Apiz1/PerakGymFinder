<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class GymOwnerController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('Owner/Dashboard');
    }
}
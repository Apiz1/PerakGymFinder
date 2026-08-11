<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\GymImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PhotoGymController extends Controller
{
    /** Max photos allowed per gym — keeps the gallery manageable and storage in check. */
    private const MAX_IMAGES = 10;

    /**
     * Photo management page — owner's own gym only, same "no {gym} param" pattern
     * as CreateGymController/EditGymController.
     */
    public function index(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        return Inertia::render('Owner/Gym/Photos', [
            'images' => $gym->images()->orderBy('sort_order')->get(),
            'maxImages' => self::MAX_IMAGES,
        ]);
    }

    /**
     * Upload one or more photos. Stored on the `public` disk since these
     * need to be visible on the gym's public profile page — unlike the
     * business verification doc, which deliberately stays on `local`.
     */
    public function store(Request $request): RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        abort_unless($gym, 404);

        $currentCount = $gym->images()->count();

        $request->validate([
            'images' => 'required|array|min:1|max:'.max(0, self::MAX_IMAGES - $currentCount),
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120', // 5MB each
        ], [
            'images.max' => 'You can have at most '.self::MAX_IMAGES.' photos per gym.',
        ]);

        $nextSortOrder = $gym->images()->max('sort_order') + 1;
        $hasPrimaryAlready = $gym->images()->where('is_primary', true)->exists();

        foreach ($request->file('images') as $index => $file) {
            $path = $file->store('gym-images', 'public');

            $gym->images()->create([
                'image_path' => $path,
                'is_primary' => ! $hasPrimaryAlready && $index === 0,
                'sort_order' => $nextSortOrder + $index,
            ]);
        }

        return back()->with('success', 'Photos uploaded.');
    }

    /**
     * Set one photo as the primary/cover image — unsets any previous primary first.
     */
    public function setPrimary(GymImage $image): RedirectResponse
    {
        $this->authorizeOwnership($image);

        $image->gym->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return back()->with('success', 'Cover photo updated.');
    }

    /**
     * Delete a photo — removes both the database row and the actual file on disk.
     */
    public function destroy(GymImage $image): RedirectResponse
    {
        $this->authorizeOwnership($image);

        $wasPrimary = $image->is_primary;
        $gym = $image->gym;

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        // If the deleted photo was the cover image, promote the next one automatically
        // so the gym never ends up with photos but no cover.
        if ($wasPrimary) {
            $gym->images()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }

        return back()->with('success', 'Photo removed.');
    }

    /**
     * Confirms the image actually belongs to the authenticated owner's own gym —
     * without this, an owner could pass any {image} ID in the URL and delete
     * or reassign photos belonging to a completely different gym.
     */
    private function authorizeOwnership(GymImage $image): void
    {
        abort_unless($image->gym->owner_id === Auth::id(), 403);
    }
}
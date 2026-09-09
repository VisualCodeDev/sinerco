<?php

namespace App\Http\Controllers;

use App\Models\DailyField;
use App\Models\Subfield;
use App\Models\UnitField;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DailyFieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Render halaman pengaturan input field unit
        return Inertia::render('Unit/InputFieldSetting');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function getFields()
    {
        try {
            // Ambil semua data DailyField beserta relasi subfields-nya
            $data = DailyField::with('subfields')->get();
            return response()->json($data);
        } catch (\Exception $e) {
            // Catat error ke log jika gagal ambil data
            \Log::error('Error ambil field: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * Menerima `name`, `slug` opsional (kalau kosong di-generate dari name),
     * dan `subfields` opsional (array of {name, slug?}) untuk langsung
     * membuat subfield sekaligus saat field baru dibuat.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:daily_fields,name',
            'slug' => 'nullable|string|max:255|unique:daily_fields,slug',
            'active' => 'nullable|boolean',
            'subfields' => 'nullable|array',
            'subfields.*.name' => 'required_with:subfields|string|max:255',
            'subfields.*.slug' => 'nullable|string|max:255',
        ]);

        try {
            $field = DailyField::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'] ?: Str::slug($validated['name'], '_'),
                'active' => $validated['active'] ?? true,
            ]);

            foreach ($validated['subfields'] ?? [] as $sub) {
                Subfield::create([
                    'field_id' => $field->id,
                    'name' => $sub['name'],
                    'slug' => $sub['slug'] ?: Str::slug($sub['name'], '_'),
                ]);
            }

            return response()->json([
                'type' => 'success',
                'text' => 'Field created successfully.',
                'data' => $field->load('subfields'),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating field: ' . $e->getMessage());
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(DailyField $dailyField)
    {
        return response()->json($dailyField->load('subfields'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DailyField $dailyField)
    {
        return response()->json($dailyField->load('subfields'));
    }

    /**
     * Update the specified resource in storage.
     *
     * IMPORTANT: `slug` sengaja TIDAK bisa diubah lewat endpoint ini.
     * `slug` dipakai sebagai key di banyak tempat (report data JSON,
     * unitSetting, decimalSetting, thresholdSetting, visibilitySetting,
     * dsb, tersimpan per-client/per-report). Mengubah slug field yang
     * sudah pernah dipakai akan memutus koneksi ke data historis tanpa
     * ada cara mudah untuk migrasi data lama tersebut. Supaya aman,
     * hanya `name` (dan `active`) yang boleh diedit di sini; slug
     * hanya ditentukan sekali saat field dibuat (lihat store()).
     */
    public function update(Request $request, DailyField $dailyField)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('daily_fields', 'name')->ignore($dailyField->id),
            ],
            'active' => 'nullable|boolean',
        ]);

        try {
            $dailyField->update([
                'name' => $validated['name'],
                'active' => $validated['active'] ?? $dailyField->active,
            ]);

            return response()->json([
                'type' => 'success',
                'text' => 'Field updated successfully.',
                'data' => $dailyField->fresh()->load('subfields'),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating field: ' . $e->getMessage());
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * Field yang masih direferensikan oleh unit_fields (artinya masih
     * dipakai di form input laporan salah satu unit) TIDAK boleh dihapus,
     * supaya tidak merusak data laporan historis unit tersebut secara
     * diam-diam. Subfields anaknya ikut terhapus lewat cascade di DB
     * hanya kalau field-nya sendiri berhasil dihapus.
     */
    public function destroy(DailyField $dailyField)
    {
        try {
            $inUse = UnitField::where('field_id', $dailyField->id)->exists();
            if ($inUse) {
                return response()->json([
                    'type' => 'error',
                    'text' => 'Field ini masih digunakan oleh salah satu unit dan tidak bisa dihapus.',
                ], 422);
            }

            $dailyField->delete();

            return response()->json([
                'type' => 'success',
                'text' => 'Field deleted successfully.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting field: ' . $e->getMessage());
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created subfield for the given field.
     */
    public function storeSubfield(Request $request, DailyField $dailyField)
    {
        $validated = $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('subfields')->where('field_id', $dailyField->id),
            ],
            'slug' => 'nullable|string|max:255|unique:subfields,slug',
        ]);

        try {
            $subfield = Subfield::create([
                'field_id' => $dailyField->id,
                'name' => $validated['name'],
                'slug' => $validated['slug'] ?: Str::slug($validated['name'], '_'),
            ]);

            return response()->json([
                'type' => 'success',
                'text' => 'Subfield created successfully.',
                'data' => $subfield,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating subfield: ' . $e->getMessage());
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }

    /**
     * Update a subfield's name. Slug is read-only for the same reason as
     * DailyField::slug above (used as a data key elsewhere).
     */
    public function updateSubfield(Request $request, Subfield $subfield)
    {
        $validated = $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('subfields')->where('field_id', $subfield->field_id)->ignore($subfield->id),
            ],
        ]);

        try {
            $subfield->update(['name' => $validated['name']]);

            return response()->json([
                'type' => 'success',
                'text' => 'Subfield updated successfully.',
                'data' => $subfield->fresh(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating subfield: ' . $e->getMessage());
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove a subfield. Subfields aren't referenced by unit_fields
     * directly (that table only points at daily_fields), but the parent
     * field could still be in use, so we don't block on that here — a
     * subfield's own historical data lives keyed by its slug inside the
     * report JSON, same caveat as deleting a top-level field.
     */
    public function destroySubfield(Subfield $subfield)
    {
        try {
            $subfield->delete();

            return response()->json([
                'type' => 'success',
                'text' => 'Subfield deleted successfully.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting subfield: ' . $e->getMessage());
            return response()->json(['type' => 'error', 'text' => $e->getMessage()], 500);
        }
    }
}

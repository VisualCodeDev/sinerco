<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContractController extends Controller
{
    // Ambil kontrak untuk 1 unit_position (null kalau belum pernah dibuat)
    public function show($unit_position_id)
    {
        $contract = Contract::where('unit_position_id', $unit_position_id)->first();
        return response()->json($contract);
    }

    // Simpan/update data kontrak (tanpa file) untuk 1 unit_position
    public function store(Request $request)
    {
        $val = $request->validate([
            'unit_position_id' => 'required|exists:unit_positions,id',
            'contract_number' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:active,expired,terminated',
        ]);

        $contract = Contract::updateOrCreate(
            ['unit_position_id' => $val['unit_position_id']],
            [
                'contract_number' => $val['contract_number'] ?? null,
                'start_date' => $val['start_date'] ?? null,
                'end_date' => $val['end_date'] ?? null,
                'status' => $val['status'],
            ]
        );

        return response()->json([
            'type' => 'success',
            'text' => 'Contract saved.',
            'data' => $contract,
        ]);
    }

    // Upload/ganti dokumen PDF kontrak. Dipisah dari store() karena ini
    // multipart/form-data, bukan JSON biasa. Cuma path-nya yang disimpan di DB --
    // file-nya sendiri di storage/app/public/contracts, jadi baca data kontrak
    // (show/store di atas) tetap ringan, tidak ikut nge-load isi PDF-nya.
    public function uploadDocument(Request $request)
    {
        $val = $request->validate([
            'unit_position_id' => 'required|exists:unit_positions,id',
            'document' => 'required|file|mimes:pdf|max:10240', // max 10MB
        ]);

        $contract = Contract::firstOrCreate(
            ['unit_position_id' => $val['unit_position_id']],
            ['status' => 'active'],
        );

        // Hapus file lama dulu kalau ada, supaya storage tidak numpuk file yatim
        if ($contract->document_path) {
            Storage::disk('public')->delete($contract->document_path);
        }

        $path = $request->file('document')->store('contracts', 'public');
        $contract->update(['document_path' => $path]);

        return response()->json([
            'type' => 'success',
            'text' => 'Contract document uploaded.',
            'data' => $contract,
        ]);
    }

    // Hapus dokumen kontrak (tanpa hapus data kontrak itu sendiri)
    public function destroyDocument($unit_position_id)
    {
        $contract = Contract::where('unit_position_id', $unit_position_id)->first();
        if (!$contract || !$contract->document_path) {
            return response()->json(['type' => 'error', 'text' => 'No document to remove.'], 404);
        }

        Storage::disk('public')->delete($contract->document_path);
        $contract->update(['document_path' => null]);

        return response()->json(['type' => 'success', 'text' => 'Contract document removed.']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Kursus;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use setasign\Fpdi\Tcpdf\Fpdi;
use Inertia\Inertia;
use TCPDF_FONTS; // Add for font management if needed, though we will rely on built-in fonts for simplicity

class CertificateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            // Log for debugging
            \Illuminate\Support\Facades\Log::info('Certificate index called', [
                'user_id' => Auth::id(),
                'user_authenticated' => Auth::check(),
                'user' => Auth::user(),
            ]);

            if (!Auth::check()) {
                \Illuminate\Support\Facades\Log::warning('User not authenticated in CertificateController@index');
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $userId = Auth::id();
            $certificates = Certificate::where('user_id', $userId)
                ->with('course')
                ->orderBy('issued_at', 'desc')
                ->get();

            // Log for debugging
            \Illuminate\Support\Facades\Log::info('Certificates found', [
                'count' => $certificates->count(),
                'user_id' => $userId,
            ]);

            // Check if this is an API request
            if (request()->wantsJson()) {
                return response()->json([
                    'certificates' => $certificates
                ]);
            }

            return Inertia::render('dashboard/certificates/page', [
                'certificates' => $certificates
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in CertificateController@index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if (request()->wantsJson()) {
                return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
            }

            throw $e;
        }
    }

    /**
     * Check if user is eligible for a certificate for a specific course
     */
    public function checkEligibility($courseId)
    {
        try {
            \Illuminate\Support\Facades\Log::info('Check eligibility called', [
                'course_id' => $courseId,
                'user_id' => Auth::id(),
            ]);

            if (!Auth::check()) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $isEligible = Certificate::isEligibleForCertificate(Auth::id(), $courseId);

            \Illuminate\Support\Facades\Log::info('Eligibility check result', [
                'eligible' => $isEligible,
                'user_id' => Auth::id(),
                'course_id' => $courseId,
            ]);

            return response()->json([
                'eligible' => $isEligible
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in CertificateController@checkEligibility', [
                'error' => $e->getMessage(),
                'course_id' => $courseId,
            ]);

            return response()->json(['error' => 'Failed to check eligibility'], 500);
        }
    }

    /**
     * Issue a certificate for a completed course
     */
    public function issueCertificate($courseId)
    {
        try {
            \Illuminate\Support\Facades\Log::info('Issue certificate called', [
                'course_id' => $courseId,
                'user_id' => Auth::id(),
            ]);

            if (!Auth::check()) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $certificate = Certificate::issueCertificate(Auth::id(), $courseId);

            if ($certificate) {
                \Illuminate\Support\Facades\Log::info('Certificate issued successfully', [
                    'certificate_id' => $certificate->id,
                    'user_id' => Auth::id(),
                    'course_id' => $courseId,
                ]);

                return response()->json([
                    'success' => true,
                    'certificate' => $certificate
                ]);
            }

            \Illuminate\DFacades\Log::warning('User not eligible for certificate', [
                'user_id' => Auth::id(),
                'course_id' => $courseId,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'You are not eligible for a certificate for this course.'
            ], 400);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in CertificateController@issueCertificate', [
                'error' => $e->getMessage(),
                'course_id' => $courseId,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to issue certificate: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single certificate
     */
    public function getCertificate($id)
    {
        try {
            \Illuminate\Support\Facades\Log::info('Get certificate called', [
                'certificate_id' => $id,
                'user_id' => Auth::id(),
            ]);

            if (!Auth::check()) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $certificate = Certificate::where('user_id', Auth::id())
                ->with('course')
                ->findOrFail($id);

            return response()->json([
                'certificate' => $certificate
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in CertificateController@getCertificate', [
                'error' => $e->getMessage(),
                'certificate_id' => $id,
            ]);

            return response()->json(['error' => 'Certificate not found'], 404);
        }
    }

    /**
     * Download a certificate as PDF
     */
    public function download($id)
    {
        try {
            $certificate = Certificate::where('user_id', Auth::id())
                ->findOrFail($id);

            // Always regenerate the PDF with the latest design instead of using cached version
            // This ensures users get the updated certificate design
            $pdfPath = $this->generateCertificatePdf($certificate);

            // Update certificate with new PDF path
            $certificate->update(['pdf_path' => $pdfPath]);

            // Return the PDF download response
            return Storage::download($pdfPath, "certificate-{$certificate->certificate_number}.pdf");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in CertificateController@download', [
                'error' => $e->getMessage(),
                'certificate_id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);

            // Return a more user-friendly error response
            return response()->json([
                'success' => false,
                'message' => 'Failed to download certificate. Please try again.'
            ], 500);
        }
    }

    /**
     * Generate a PDF certificate
     * Modifies to match the provided image as closely as possible.
     */
    private function generateCertificatePdf($certificate)
    {
        // Define colors based on the image:
        // Main Blue: #0066CC (RGB: 0, 102, 204)
        // Accent Orange: #E66A23 (RGB: 230, 106, 35)
        // Dark Blue/Black-ish Text: #002D56 (RGB: 0, 45, 86) - based on observation
        $mainBlue = [0, 102, 204];
        $darkBlue = [0, 45, 86];
        $accentOrange = [230, 106, 35];
        $black = [0, 0, 0];
        $gray = [50, 50, 50]; // For date and smaller text

        // Create a new FPDI instance
        $pdf = new Fpdi('L', 'mm', 'A4'); // A4 Landscape
        $pageWidth = 297; // A4 width in mm (Landscape)
        $pageHeight = 210; // A4 height in mm (Landscape)

        // Set document information
        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor('SMK Telekomunikasi Telesandi Bekasi');
        $pdf->SetTitle('Piagam Penghargaan');
        $pdf->SetSubject('Penghargaan Guru Berdedikasi');
        $pdf->SetKeywords('piagam, penghargaan, guru, telesandi');

        // Add a page
        $pdf->AddPage('L');

        // Set margins - use small margins for design control
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(false);

        // --- BACKGROUND / FOOTER (ORANGE/DARK BLUE) ---
        // Orange Bar (Bottom Footer)
        $orangeBarHeight = 45; // Made higher to accommodate taller blue bar
        $pdf->SetFillColor($accentOrange[0], $accentOrange[1], $accentOrange[2]);
        $pdf->Rect(0, $pageHeight - $orangeBarHeight, $pageWidth, $orangeBarHeight, 'F');

        // Dark Blue Bar (Bottom Footer) - slightly smaller, inside the orange
        $darkBlueBarHeight = 40; // Made higher
        $pdf->SetFillColor($darkBlue[0], $darkBlue[1], $darkBlue[2]);
        $pdf->Rect(0, $pageHeight - $darkBlueBarHeight, $pageWidth, $darkBlueBarHeight, 'F');

        // --- RIGHT BLUE RIBBON SHAPE (Made shorter) ---
        $ribbonWidth = 35; // Made smaller
        $ribbonHeight = $pageHeight * 0.5; // Made shorter - Approx height
        $ribbonX = $pageWidth - $ribbonWidth - 10; // Shifted left by 10mm
        $ribbonY = 0;
        $pdf->SetFillColor($mainBlue[0], $mainBlue[1], $mainBlue[2]);
        $pdf->Rect($ribbonX, $ribbonY, $ribbonWidth, $ribbonHeight, 'F');

        // V-cut shape at the bottom of the ribbon using a polygon
        $vCutHeight = 20;
        $vCutDepth = 15;
        $pdf->Polygon([
            $ribbonX, $ribbonHeight, // Top left of the V-cut
            $ribbonX + $ribbonWidth, $ribbonHeight, // Top right of the V-cut
            $ribbonX + $ribbonWidth - $vCutDepth, $ribbonHeight + $vCutHeight, // Bottom point of V-cut (right side)
            $ribbonX + $vCutDepth, $ribbonHeight + $vCutHeight, // Bottom point of V-cut (left side)
            $ribbonX, $ribbonHeight, // Back to start
        ], 'F');

        // --- TOP-LEFT LOGO AND SCHOOL HEADER ---
        $logoSize = 18; // Size for logo and flag
        $logoX = 18;
        $logoY = 15;

        // School Logo
        $logoPath = public_path('Logo_SMK_Telekomunikasi_Telesandi_Bekasi.png'); // Ensure this path is correct
        if (file_exists($logoPath)) {
            $pdf->Image($logoPath, $logoX, $logoY, $logoSize, $logoSize, 'PNG');
        }

        // School Name (SMK TELEKOMUNIKASI TELESANDI BEKASI)
        $pdf->SetFont('helvetica', 'B', 15); // Slightly larger
        $pdf->SetTextColor($darkBlue[0], $darkBlue[1], $darkBlue[2]);
        $pdf->SetXY($logoX + $logoSize + 3, $logoY);
        $pdf->Write(0, 'SMK TELEKOMUNIKASI');

        $pdf->SetFont('helvetica', 'B', 15); // Slightly larger
        $pdf->SetTextColor($mainBlue[0], $mainBlue[1], $mainBlue[2]);
        $pdf->SetXY($logoX + $logoSize + 3, $logoY + 6);
        $pdf->Write(0, 'TELESANDI BEKASI');

        // Certificate Number (Top Right)
        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(50, 50, 50); // Gray for small text
        $numberText = 'Nomor : ' . ($certificate->certificate_number ?? '421.800/633/SMK TS VII/2024');
        $pdf->SetXY($ribbonX - 100 - 15, $logoY + 5); // Shifted further left
        $pdf->Cell(90, 5, $numberText, 0, 0, 'R');

        // --- MAIN TITLE (PIAGAM PENGHARGAAN) ---
        $pdf->SetFont('helvetica', 'B', 32); // Made bigger
        $pdf->SetTextColor($darkBlue[0], $darkBlue[1], $darkBlue[2]);
        $pdf->SetXY($logoX, 55);
        $pdf->Cell(180, 15, 'SERTIFIKAT', 0, 1, 'L');

        // Sub-title (GURU BERDEDIKASI TAHUN PELAJARAN 2023/2024)
        $pdf->SetFont('helvetica', 'B', 13); // Made bigger
        $pdf->SetTextColor($darkBlue[0], $darkBlue[1], $darkBlue[2]);
        $pdf->SetXY($logoX, 70);
        $pdf->Cell(180, 5, 'KARENA TELAH MENYELESAIKAN KURSUS - ' . strtoupper($certificate->metadata['course_title'] ?? 'Course'), 0, 1, 'L');

        // --- AWARDING TEXT ---
        $pdf->SetFont('helvetica', '', 12); // Made bigger
        $pdf->SetTextColor($black[0], $black[1], $black[2]);
        $pdf->SetXY($logoX, 95);
        $pdf->Write(0, 'Dengan bangga ');

        $pdf->SetFont('helvetica', 'B', 12); // Made bigger
        $pdf->Write(0, 'sertifikat ');

        $pdf->SetFont('helvetica', '', 12); // Made bigger
        $pdf->Write(0, 'di berikan kepada: ');

        // --- RECIPIENT NAME (JAMRONI, S. Pd.I) ---
        $recipientName = $certificate->metadata['user_name'] ?? 'Jamroni, S. Pd.I';

        // Use Times Italic as a script approximation
        $pdf->SetFont('times', 'I', 36);
        $pdf->SetTextColor($darkBlue[0], $darkBlue[1], $darkBlue[2]);
        $pdf->SetXY($logoX, 105);
        $pdf->Cell(180, 15, $recipientName, 0, 1, 'L');

        // Draw the underline for the name
        $pdf->SetFont('times', 'I', 36);
        $nameWidth = $pdf->GetStringWidth($recipientName);
        $pdf->SetDrawColor($darkBlue[0], $darkBlue[1], $darkBlue[2]);
        $pdf->SetLineWidth(0.4);
        $pdf->Line($logoX, 123, $logoX + $nameWidth + 2, 123);

        // --- MOTIVATION TEXT ---
        $pdf->SetFont('helvetica', '', 13); // Made bigger
        $pdf->SetTextColor($black[0], $black[1], $black[2]);
        $pdf->SetXY($logoX, 138);
        $motivationText = 'Semoga sertifikat ini dapat menjadi motivasi untuk berprestasi lebih baik lagi dimasa yang akan datang.';
        $pdf->Write(0, $motivationText);

        // --- SIGNATURE BLOCK (FOOTER AREA TEXT) ---
        $date = $certificate->issued_at ? $certificate->issued_at->format('j F Y') : now()->format('j F Y');
        $signerName = $certificate->metadata['signer_name'] ?? 'Guruh Wijanarko, S.T., M.Pd.';
        $signerNpk = $certificate->metadata['signer_npk'] ?? '2008 0002';

        $footerTextY = $pageHeight - $darkBlueBarHeight; // Move text lower
        $footerLineHeight = 5;
        $signatureBlockX = $pageWidth - $ribbonWidth - 70; // X position for the signature block (right side)
        $dateBlockX = $logoX; // X position for the date (left side)

        // 1. Date and Location (Centered above the signatory title)
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(255, 255, 255); // White text
        // Position the date text aligned with the signatory title and move it slightly to the right
        $dateText = 'Bekasi, ' . $date;
        $dateTextWidth = $pdf->GetStringWidth($dateText);
        // Align with signatory title and move slightly to the right
        $centeredDateX = $signatureBlockX + 0; // Move less to the right
        $pdf->SetXY($centeredDateX, $footerTextY + 3); // Move date text lower
        // Using "Bekasi, 27 October 2025" as placeholder or using issued_at
        $pdf->Write($footerLineHeight, $dateText);

        // 2. Signatory Title (Positioned below the date)
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(255, 255, 255);
        $title = 'Kepala SMK Telekomunikasi Telesandi Bekasi';
        $titleWidth = $pdf->GetStringWidth($title);
        $pdf->SetXY($signatureBlockX, $footerTextY + 8); // Positioned below date
        $pdf->Cell(0, $footerLineHeight, $title, 0, 1, 'L'); // Align left from the X point

        // 3. Vertical Space for Signature (Approx 10mm)
        // We skip two lines of space before the name
        $ySignatureStart = $footerTextY + ($footerLineHeight * 3) + 8; // Adjusted for new layout

        // 4. Signer Name (Underneath where the signature would go)
        $pdf->SetFont('helvetica', 'B', 10); // Same size as other footer text
        $pdf->SetXY($signatureBlockX, $ySignatureStart + 3); // Move 3 units lower
        $pdf->Write($footerLineHeight, $signerName);

        // 5. Underline for Signer Name
        $pdf->SetFont('helvetica', 'B', 10); // Same size as other footer text
        $signerNameWidth = $pdf->GetStringWidth($signerName);
        $pdf->SetDrawColor(255, 255, 255); // White underline
        $pdf->SetLineWidth(0.2);
        // Draw the line immediately below the name text
        $pdf->Line($signatureBlockX, $ySignatureStart + $footerLineHeight + 2, $signatureBlockX + $signerNameWidth, $ySignatureStart + $footerLineHeight + 2);

        // 6. NPK
        $pdf->SetFont('helvetica', '', 10); // Same size as other footer text
        $pdf->SetXY($signatureBlockX, $ySignatureStart + $footerLineHeight + 3); // Move 3 units lower
        $pdf->Write($footerLineHeight, 'NPK. ' . $signerNpk);

        // --- SAVE PDF ---
        $pdfContent = $pdf->Output('', 'S');
        $path = "certificates/certificate-{$certificate->certificate_number}.pdf";
        Storage::put($path, $pdfContent);

        return $path;
    }

    /**
     * Generate certificate PDF for existing certificate
     */
    public function generatePdf($id)
    {
        try {
            \Illuminate\Support\Facades\Log::info('Generate PDF called', [
                'certificate_id' => $id,
                'user_id' => Auth::id(),
            ]);

            if (!Auth::check()) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $certificate = Certificate::where('user_id', Auth::id())
                ->findOrFail($id);

            // Always generate a fresh PDF with the latest design
            $pdfPath = $this->generateCertificatePdf($certificate);

            // Update certificate with new PDF path
            $certificate->update(['pdf_path' => $pdfPath]);

            return response()->json([
                'success' => true,
                'message' => 'Certificate PDF generated successfully with latest design',
                'pdf_path' => $pdfPath
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in CertificateController@generatePdf', [
                'error' => $e->getMessage(),
                'certificate_id' => $id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate certificate PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the certificate details
     */
    public function show($id)
    {
        $certificate = Certificate::where('user_id', Auth::id())
            ->with('course')
            ->findOrFail($id);

        return Inertia::render('dashboard/certificates/[id]/page', [
            'certificate' => $certificate
        ]);
    }
}

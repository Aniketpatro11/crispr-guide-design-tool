import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, CheckCircle } from "lucide-react";
import { GuideRow, CAS_PAM_TABLE } from "@/lib/crispr-logic";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportReportButtonProps {
  filteredGuides: GuideRow[];
  casSystem: string;
  guideLength: number;
  gcRange: [number, number];
  cleanedSequence: string;
  chartsContainerId?: string;
}

export function ExportReportButton({
  filteredGuides,
  casSystem,
  guideLength,
  gcRange,
  cleanedSequence,
}: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const pamChoice = CAS_PAM_TABLE[casSystem];

  const generatePDF = async () => {
    setIsExporting(true);
    setIsComplete(false);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // ========== HEADER ==========
      pdf.setFillColor(28, 111, 255);
      pdf.rect(0, 0, pageWidth, 35, "F");
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("CRISPR Guide Design Report", margin, 18);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, 28);
      
      yPosition = 45;

      // ========== CONFIGURATION SUMMARY ==========
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Analysis Configuration", margin, yPosition);
      yPosition += 8;

      pdf.setDrawColor(28, 111, 255);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const configItems = [
        ["CRISPR System:", casSystem],
        ["PAM Sequence:", pamChoice],
        ["Guide Length:", `${guideLength} nt`],
        ["GC Range Filter:", `${gcRange[0]}% - ${gcRange[1]}%`],
        ["Sequence Length:", `${cleanedSequence.length} bp`],
        ["Total Guides Found:", `${filteredGuides.length}`],
      ];

      configItems.forEach(([label, value]) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(label, margin, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(value, margin + 45, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // ========== TOP GUIDES TABLE ==========
      checkNewPage(60);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Top 10 Guide RNAs", margin, yPosition);
      yPosition += 8;

      pdf.setDrawColor(28, 111, 255);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // Table headers
      const colWidths = [15, 50, 25, 20, 25, 25];
      const headers = ["Rank", "Guide Sequence (5'→3')", "PAM", "GC%", "Score", "Position"];
      
      pdf.setFillColor(240, 245, 255);
      pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 8, "F");
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(28, 111, 255);
      
      let xPos = margin + 2;
      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPosition);
        xPos += colWidths[i];
      });
      yPosition += 8;

      // Table rows
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      
      const topGuides = filteredGuides.slice(0, 10);
      topGuides.forEach((guide, index) => {
        checkNewPage(8);
        
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 255);
          pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 7, "F");
        }

        xPos = margin + 2;
        const rowData = [
          `#${guide.rank}`,
          guide.guideSeq,
          guide.matchedPam,
          `${guide.gcPercent.toFixed(1)}%`,
          guide.totalScore.toFixed(2),
          `${guide.guideStart}-${guide.guideEnd}`,
        ];

        rowData.forEach((cell, i) => {
          if (i === 1) {
            pdf.setFont("courier", "normal");
            pdf.setTextColor(10, 143, 91); // Guide green
          } else if (i === 2) {
            pdf.setFont("courier", "bold");
            pdf.setTextColor(216, 58, 58); // PAM red
          } else {
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0, 0, 0);
          }
          pdf.text(cell, xPos, yPosition);
          xPos += colWidths[i];
        });
        yPosition += 7;
      });

      yPosition += 10;

      // ========== SCORE STATISTICS ==========
      checkNewPage(40);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Score Statistics", margin, yPosition);
      yPosition += 8;

      pdf.setDrawColor(28, 111, 255);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      const scores = filteredGuides.map(g => g.totalScore);
      const gcValues = filteredGuides.map(g => g.gcPercent);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const avgGc = gcValues.reduce((a, b) => a + b, 0) / gcValues.length;
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);

      const stats = [
        ["Average Score:", avgScore.toFixed(2)],
        ["Best Score:", minScore.toFixed(2)],
        ["Worst Score:", maxScore.toFixed(2)],
        ["Average GC%:", `${avgGc.toFixed(1)}%`],
        ["Guides in Optimal GC Range (40-60%):", `${filteredGuides.filter(g => g.gcPercent >= 40 && g.gcPercent <= 60).length}`],
      ];

      pdf.setFontSize(10);
      stats.forEach(([label, value]) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(label, margin, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(value, margin + 70, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // ========== CAPTURE CHARTS ==========
      const chartsContainer = document.querySelector('[data-charts-container]');
      if (chartsContainer) {
        checkNewPage(100);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Visual Analysis", margin, yPosition);
        yPosition += 8;

        pdf.setDrawColor(28, 111, 255);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        try {
          const canvas = await html2canvas(chartsContainer as HTMLElement, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
          });
          
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error("Error capturing charts:", error);
        }
      }

      // ========== INTERPRETATION GUIDE ==========
      checkNewPage(50);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("How to Interpret Results", margin, yPosition);
      yPosition += 8;

      pdf.setDrawColor(28, 111, 255);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const interpretations = [
        "• GC% ~ 40-60% is often a comfortable range for many CRISPR systems.",
        "• Lower Total Score indicates a better guide candidate under this simplified model.",
        "• Self-complementarity metric indicates potential for hairpin formation.",
        "• Off-target-like matches are checked only against the input sequence.",
      ];

      interpretations.forEach((text) => {
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          checkNewPage(6);
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
      });

      // ========== FOOTER ==========
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages} | Made by Code Biologist (Aniket)`,
          pageWidth / 2,
          pageHeight - 8,
          { align: "center" }
        );
      }

      // Save PDF
      pdf.save(`CRISPR_Guide_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      
      setIsComplete(true);
      setTimeout(() => setIsComplete(false), 2000);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isExporting || filteredGuides.length === 0}
      className="ios-export-button"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : isComplete ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          Downloaded!
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 mr-2" />
          Export PDF Report
        </>
      )}
    </Button>
  );
}
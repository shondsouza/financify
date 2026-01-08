"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Users,
  DollarSign,
  FileText,
  Calendar,
  MapPin,
  Play,
  Square,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Edit,
  Eye,
} from "lucide-react";
import { TimeTrackingForm } from "./time-tracking-form";
import { generateProfessionalWageSlip } from "@/utils/pdfWageSlipGenerator";
import { generateSimpleWageSlip } from "@/utils/simplePdfGenerator";

export default function AssignmentTimeCard({
  assignment,
  onTimeUpdate,
  onStatusUpdate,
}) {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getStatusVariant = (status) => {
    switch (status) {
      case "assigned":
        return "outline";
      case "completed":
        return "default";
      case "paid":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "completed":
        return "text-green-700 bg-green-50 border-green-200";
      case "paid":
        return "text-purple-700 bg-purple-50 border-purple-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleTimeSubmit = async (updatedAssignment) => {
    onTimeUpdate(updatedAssignment);
    setShowTimeModal(false);
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    setError("");

    try {
      // Try professional generator first, fallback to simple generator
      try {
        await generateProfessionalWageSlip(assignment);
      } catch (professionalError) {
        console.warn(
          "Professional PDF generator failed, using simple generator:",
          professionalError
        );
        await generateSimpleWageSlip(assignment);
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "paid" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      onStatusUpdate(assignment.id, "paid");
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                {assignment.event?.title || assignment.eventTitle}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{assignment.event?.client || assignment.client}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(
                      assignment.event?.eventDate || assignment.eventDate
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {assignment.event?.location || assignment.location}
                  </span>
                </div>
              </div>
            </div>
            <Badge
              variant={getStatusVariant(assignment.status)}
              className={`${getStatusColor(
                assignment.status
              )} font-medium px-3 py-1`}
            >
              {assignment.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Team Leader</span>
              </div>
              <p className="font-semibold text-gray-900">
                {assignment.teamLeader?.name || "Unknown"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Staff Count</span>
              </div>
              <p className="font-semibold text-gray-900">
                {assignment.staffAssigned || assignment.staffCount || 0} people
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Hours</span>
              </div>
              <p className="font-semibold text-gray-900">
                {assignment.actualHours || assignment.assignedHours || 0}h
                {assignment.actualHours > 7 && (
                  <span className="text-orange-600 ml-1">
                    (+{(assignment.actualHours - 7).toFixed(1)}h OT)
                  </span>
                )}
              </p>
            </div>
          </div>

          {assignment.totalWage && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Total Wage</span>
                </div>
                <span className="font-bold text-lg text-green-800">
                  ₹{assignment.totalWage.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <div>
                  Base: ₹{assignment.basePay?.toLocaleString("en-IN") || "0"}
                </div>
                {assignment.overtimePay > 0 && (
                  <div>
                    Overtime: ₹{assignment.overtimePay.toLocaleString("en-IN")}
                  </div>
                )}
                {assignment.tlCommission > 0 && (
                  <div>
                    TL Commission: ₹
                    {assignment.tlCommission.toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </div>
          )}

          {assignment.entryTime && assignment.exitTime && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Time Tracking
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3 text-green-600" />
                  <span>
                    Entry:{" "}
                    {new Date(assignment.entryTime).toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="h-3 w-3 text-red-600" />
                  <span>
                    Exit:{" "}
                    {new Date(assignment.exitTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowTimeModal(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {assignment.actualHours ? (
                <Edit className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {assignment.actualHours ? "Edit Time" : "Log Time"}
            </Button>

            {assignment.actualHours && (
              <Button
                onClick={handleGeneratePDF}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Generate PDF
              </Button>
            )}

            <Button
              onClick={() => setShowDetailsModal(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>

            {assignment.status === "completed" && (
              <Button
                onClick={handleMarkAsPaid}
                disabled={loading}
                size="sm"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Paid
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Entry Modal */}
      <Dialog open={showTimeModal} onOpenChange={setShowTimeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Time Tracking - {assignment.event?.title || assignment.eventTitle}
            </DialogTitle>
          </DialogHeader>
          <TimeTrackingForm
            assignment={assignment}
            onTimeUpdate={handleTimeSubmit}
            onClose={() => setShowTimeModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Event
                </label>
                <p className="text-gray-900">
                  {assignment.event?.title || assignment.eventTitle}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Client
                </label>
                <p className="text-gray-900">
                  {assignment.event?.client || assignment.client}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Date
                </label>
                <p className="text-gray-900">
                  {formatDate(
                    assignment.event?.eventDate || assignment.eventDate
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Location
                </label>
                <p className="text-gray-900">
                  {assignment.event?.location || assignment.location}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Team Leader
                </label>
                <p className="text-gray-900">
                  {assignment.teamLeader?.name || "Unknown"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Staff Count
                </label>
                <p className="text-gray-900">
                  {assignment.staffAssigned || assignment.staffCount || 0}
                </p>
              </div>
            </div>

            {assignment.adminNotes && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Admin Notes
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {assignment.adminNotes}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

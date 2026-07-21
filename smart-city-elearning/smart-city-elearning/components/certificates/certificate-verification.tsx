"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Award, Calendar, CheckCircle, MapPin, Building2, Loader2, ArrowLeft } from "lucide-react"
import { supabaseBrowser } from "@/lib/supabase/browser-client"
import type { Certificate } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function CertificateVerification() {
  const { id } = useParams<{ id: string }>()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyCertificate = async () => {
      setIsLoading(true)
      try {
        // Validate UUID format
        if (!id || !UUID_REGEX.test(id)) {
          throw new Error("Invalid certificate ID format")
        }

        // Fetch certificate data
        const { data: certData, error: certError } = await supabaseBrowser
          .from("certificates")
          .select(`
            id,
            user_id,
            course_id,
            certificate_number,
            issued_at,
            verification_hash,
            status,
            course:courses(id, title, instructor, skills),
            user:users(id, name, organization, user_type, province, city)
          `)
          .eq("id", id)
          .single()

        if (certError) {
          if (certError.code === "PGRST116") {
            throw new Error("No certificate found for the given ID")
          }
          throw new Error(`Supabase certificate query failed: ${JSON.stringify(certError)}`)
        }

        if (!certData) {
          throw new Error("No certificate found for the given ID")
        }

        // Fetch enrollment data (optional, handle missing data)
        let enrollmentData = null
        try {
          const { data, error: enrollmentError } = await supabaseBrowser
            .from("enrollments")
            .select("course_id, user_id, grade")
            .eq("course_id", certData.course_id)
            .eq("user_id", certData.user_id)
            .maybeSingle() // Use maybeSingle to handle no rows

          if (enrollmentError) {
            // Log warning but don't throw; enrollment is optional
          } else {
            enrollmentData = data
          }
        } catch (err) {
        }

        const formattedData: Certificate = {
          id: certData.id,
          user_id: certData.user_id,
          course_id: certData.course_id,
          certificate_number: certData.certificate_number,
          issued_at: certData.issued_at,
          verification_hash: certData.verification_hash,
          status: certData.status,
          course: Array.isArray(certData.course) ? certData.course[0] : certData.course,
          user: Array.isArray(certData.user) ? certData.user[0] : certData.user,
          enrollment: enrollmentData ? (Array.isArray(enrollmentData) ? enrollmentData[0] : enrollmentData) : null,
        }

        setCertificate(formattedData)
      } catch (err: any) {
        setError(err.message || "Failed to verify certificate. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    verifyCertificate()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-muted-foreground">Verifying certificate...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                Verification Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error || "Certificate not found."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const certificateData = {
    id: certificate.certificate_number,
    recipientName: certificate.user?.name || "Unknown Recipient",
    courseName: certificate.course?.title || "Unknown Course",
    completionDate: certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString() : "N/A",
    instructor: certificate.course?.instructor || "Unknown Instructor",
    organization: certificate.user?.organization || "N/A",
    userType: certificate.user?.user_type || "N/A",
    location: certificate.user?.city && certificate.user?.province
      ? `${certificate.user.city}, ${certificate.user.province.charAt(0).toUpperCase() + certificate.user.province.slice(1)}`
      : certificate.user?.province
        ? certificate.user.province.charAt(0).toUpperCase() + certificate.user.province.slice(1)
        : "N/A",
    grade: certificate.enrollment?.grade ? `${certificate.enrollment.grade}%` : "N/A",
    skills: certificate.course?.skills || [],
    status: certificate.status,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Certificate Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8 rounded-lg">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground">Certificate Verified</h2>
                <p className="text-muted-foreground">This certificate is valid and issued by the SSC Academy Cagayan Valley under the Smart and Sustainable Communities Program of DOST Region 2.</p>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className={certificateData.status === "active" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    Status: {certificateData.status.charAt(0).toUpperCase() + certificateData.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-muted-foreground">Recipient</p>
                  <h3 className="text-2xl font-bold">{certificateData.recipientName}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{certificateData.organization}</span>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground">Course</p>
                  <h4 className="text-xl font-bold">{certificateData.courseName}</h4>
                  <p className="text-muted-foreground">Instructed by {certificateData.instructor}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-semibold">{certificateData.completionDate}</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">Grade</p>
                    <p className="font-semibold">{certificateData.grade}</p>
                  </div>
                  <div className="text-center">
                    <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{certificateData.location}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground">Skills Demonstrated:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {certificateData.skills.length > 0 ? (
                      certificateData.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills listed</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Certificate ID</p>
                      <p className="font-mono text-sm">{certificateData.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Hash</p>
                      <p className="font-mono text-sm">{certificate.verification_hash?.slice(0, 8) || "N/A"}...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
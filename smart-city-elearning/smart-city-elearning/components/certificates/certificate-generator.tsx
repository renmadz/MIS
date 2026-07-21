"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, CheckCircle, Clock, Download, Share2 } from "lucide-react"
import { useState } from "react"

interface CertificateGeneratorProps {
  courseId: string
  userId: string
  courseData: {
    title: string
    instructor: string
    completionDate: string
    grade: number
    skills: string[]
  }
  userData: {
    name: string
    organization: string
    userType: string
  }
}

export function CertificateGenerator({ courseId, userId, courseData, userData }: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [certificateId, setCertificateId] = useState<string | null>(null)

  const handleGenerateCertificate = async () => {
    setIsGenerating(true)

    // Simulate certificate generation process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Generate certificate ID
    const newCertificateId = `SLR2-${courseId.toUpperCase()}-${Date.now()}`
    setCertificateId(newCertificateId)
    setIsGenerated(true)
    setIsGenerating(false)
  }

  if (isGenerated && certificateId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Certificate Generated Successfully!
          </CardTitle>
          <CardDescription>Your certificate is ready for download and sharing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-green-600" />
              <span className="font-medium">Certificate ID: {certificateId}</span>
            </div>
            <p className="text-sm text-green-700">
              Your certificate has been generated and recorded on the blockchain for permanent verification.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share Certificate
            </Button>
          </div>

          <div className="text-center">
            <Button variant="link" className="text-sm">
              View Certificate Details
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 animate-spin" />
            Generating Certificate...
          </CardTitle>
          <CardDescription>Please wait while we create your certificate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Validating course completion</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating certificate template</span>
              <span>75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Recording on blockchain</span>
              <span>45%</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>

          <p className="text-sm text-muted-foreground text-center">This process may take a few moments...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Generate Certificate
        </CardTitle>
        <CardDescription>Create your official certificate for course completion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Course:</span>
            <span className="font-medium">{courseData.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Instructor:</span>
            <span className="font-medium">{courseData.instructor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Completion Date:</span>
            <span className="font-medium">{courseData.completionDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Final Grade:</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {courseData.grade}%
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Skills Demonstrated:</span>
          <div className="flex flex-wrap gap-2">
            {courseData.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Your certificate will be digitally signed and recorded on the blockchain for permanent verification.
          </p>
          <Button onClick={handleGenerateCertificate} className="w-full gap-2">
            <Award className="w-4 h-4" />
            Generate My Certificate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

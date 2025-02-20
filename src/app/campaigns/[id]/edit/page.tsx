"use client";

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { campaignSchema, type CampaignFormData } from '@/lib/validations/campaign'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useDropzone } from 'react-dropzone'
import { useUploadThing } from '@/lib/uploadthing'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import Compressor from 'compressorjs'
import {
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface Campaign {
  id: number
  campaignName: string
  description: string
  startDate: string
  endDate: string
  timeZone: string
  currency: string
  totalBudget: number
  socialMediaBudget: number
  platform: string
  influencerHandle: string
  submissionStatus: string
  
  // Step 2 data
  mainMessage: string
  hashtags: string
  memorability: string
  keyBenefits: string
  expectedAchievements: string
  purchaseIntent: string
  brandPerception: string
  primaryKPI: string
  secondaryKPIs: string[]
  features: string[]

  // Relations
  primaryContact: {
    firstName: string
    surname: string
    email: string
    position: string
  }
  secondaryContact: {
    firstName: string
    surname: string
    email: string
    position: string
  }
  audience: {
    age1824: number
    age2534: number
    age3544: number
    age4554: number
    age5564: number
    age65plus: number
    otherGender: string
    educationLevel: string
    jobTitles: string
    incomeLevel: string
    locations: { location: string }[]
    genders: { gender: string }[]
    screeningQuestions: { question: string }[]
    languages: { language: string }[]
    competitors: { competitor: string }[]
  }
  creativeAssets: {
    id: number
    type: string
    url: string
    title: string
    description: string
    influencerAssigned: string
    influencerHandle: string
    influencerBudget: number
  }[]
  creativeRequirements: {
    id: number
    requirement: string
  }[]
}

interface PreviewAsset {
  type: string
  url: string
  title: string
  influencerAssigned: string
  influencerHandle: string
  influencerBudget: number
}

interface UploadAttempt {
  file: File
  attempts: number
  status: 'pending' | 'uploading' | 'failed' | 'success'
}

export default function EditCampaign() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewAsset, setPreviewAsset] = useState<PreviewAsset | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({})
  const [uploadAttempts, setUploadAttempts] = useState<{ [key: number]: UploadAttempt }>({})
  const maxRetries = 3

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    mode: 'onBlur' // Validate on blur
  })

  const { startUpload, isUploading } = useUploadThing("campaignAsset")

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetch(`/api/campaigns/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch campaign')
        const data = await res.json()
        
        // Set form values
        Object.entries(data).forEach(([key, value]) => {
          setValue(key as keyof CampaignFormData, value)
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchCampaign()
    }
  }, [params.id, setValue])

  const onSubmit = async (data: CampaignFormData) => {
    try {
      const res = await fetch(`/api/campaigns/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to update campaign')
      
      router.push(`/campaigns/${params.id}`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(watch('creativeAssets'))
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setValue('creativeAssets', items)
  }

  const addCreativeAsset = () => {
    const currentAssets = watch('creativeAssets') || []
    setValue('creativeAssets', [
      ...currentAssets,
      {
        id: Date.now(),
        type: '',
        url: '',
        title: '',
        description: '',
        influencerAssigned: '',
        influencerHandle: '',
        influencerBudget: 0
      }
    ])
  }

  const removeCreativeAsset = (index: number) => {
    const currentAssets = watch('creativeAssets') || []
    setValue('creativeAssets', currentAssets.filter((_, i) => i !== index))
  }

  const onRequirementsDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(watch('creativeRequirements'))
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setValue('creativeRequirements', items)
  }

  const addRequirement = () => {
    const currentRequirements = watch('creativeRequirements') || []
    setValue('creativeRequirements', [
      ...currentRequirements,
      {
        id: Date.now(),
        requirement: ''
      }
    ])
  }

  const removeRequirement = (index: number) => {
    const currentRequirements = watch('creativeRequirements') || []
    setValue('creativeRequirements', currentRequirements.filter((_, i) => i !== index))
  }

  // Sophisticated file validation
  const validateFile = (file: File) => {
    const maxSize = file.type.startsWith('image/') ? 4 * 1024 * 1024 : 16 * 1024 * 1024
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif']
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']

    if (file.type.startsWith('image/') && !allowedImageTypes.includes(file.type)) {
      toast.error('Invalid image type. Please use JPG, PNG or GIF')
      return false
    }

    if (file.type.startsWith('video/') && !allowedVideoTypes.includes(file.type)) {
      toast.error('Invalid video type. Please use MP4, MOV or AVI')
      return false
    }

    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`)
      return false
    }

    return true
  }

  // File compression
  const compressFile = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file

    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8, // 80% quality
        maxWidth: 1920,
        maxHeight: 1080,
        success: (compressedFile) => {
          resolve(new File([compressedFile], file.name, { type: file.type }))
        },
        error: (err) => {
          console.error('Compression failed:', err)
          reject(err)
        },
      })
    })
  }

  // Batch upload handling
  const handleBatchUpload = async (index: number, files: File[]) => {
    const validFiles = files.filter(validateFile)
    if (validFiles.length === 0) return

    try {
      const compressedFiles = await Promise.all(
        validFiles.map(file => compressFile(file))
      )

      setUploadAttempts(prev => ({
        ...prev,
        [index]: {
          file: compressedFiles[0],
          attempts: 0,
          status: 'pending'
        }
      }))

      await handleFileUpload(index, compressedFiles)
    } catch (error) {
      toast.error('Failed to process files')
      console.error('Batch upload failed:', error)
    }
  }

  // Retry functionality
  const retryUpload = async (index: number) => {
    const attempt = uploadAttempts[index]
    if (!attempt || attempt.attempts >= maxRetries) {
      toast.error('Maximum retry attempts reached')
      return
    }

    setUploadAttempts(prev => ({
      ...prev,
      [index]: {
        ...attempt,
        attempts: attempt.attempts + 1,
        status: 'uploading'
      }
    }))

    await handleFileUpload(index, [attempt.file])
  }

  // File type icon component
  const FileTypeIcon = ({ type, className = "w-6 h-6" }: { type: string, className?: string }) => {
    if (type.startsWith('image/')) {
      return <PhotoIcon className={className} />
    } else if (type.startsWith('video/')) {
      return <VideoCameraIcon className={className} />
    }
    return <DocumentIcon className={className} />
  }

  const handleFileUpload = async (index: number, files: File[]) => {
    const file = files[0]
    if (!validateFile(file)) return

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [index]: Math.min((prev[index] || 0) + 10, 90)
        }))
      }, 100)

      const uploadedFiles = await startUpload(files)
      
      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [index]: 100 }))

      if (uploadedFiles) {
        const asset = watch(`creativeAssets.${index}`)
        setValue(`creativeAssets.${index}`, {
          ...asset,
          url: uploadedFiles[0].url,
          type: files[0].type.startsWith('image/') ? 'image' : 'video'
        })
        toast.success('File uploaded successfully')
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.')
      console.error('Upload failed:', error)
    } finally {
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[index]
          return newProgress
        })
      }, 1000)
    }
  }

  const handleFileDelete = async (index: number) => {
    try {
      const asset = watch(`creativeAssets.${index}`)
      if (asset.url) {
        // Call your API to delete the file from storage
        await fetch(`/api/uploadthing/delete`, {
          method: 'DELETE',
          body: JSON.stringify({ url: asset.url })
        })

        // Update the form state
        setValue(`creativeAssets.${index}.url`, '')
        setValue(`creativeAssets.${index}.type`, '')
        toast.success('File deleted successfully')
      }
    } catch (error) {
      toast.error('Failed to delete file')
      console.error('Delete failed:', error)
    }
  }

  const FileUploadField = ({ index }: { index: number }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
        'video/*': ['.mp4', '.mov', '.avi']
      },
      maxSize: 16777216, // 16MB
      onDrop: (acceptedFiles) => handleBatchUpload(index, acceptedFiles),
      multiple: true // Enable batch upload
    })

    const attempt = uploadAttempts[index]

    return (
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <FileTypeIcon 
              type={watch(`creativeAssets.${index}.type`) || 'unknown'}
              className="w-8 h-8 text-gray-400"
            />
            {isUploading ? (
              <p>Uploading...</p>
            ) : isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <p>Drag & drop files here, or click to select files</p>
            )}
            <p className="text-sm text-gray-500">
              Supports: Images (PNG, JPG, GIF) and Videos (MP4, MOV, AVI)
              <br />
              Max size: Images - 4MB, Videos - 16MB
            </p>
          </div>
        </div>

        {/* Progress Bar with Retry Button */}
        {uploadProgress[index] !== undefined && (
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress[index]}%` }}
              />
            </div>
            {attempt?.status === 'failed' && attempt.attempts < maxRetries && (
              <button
                onClick={() => retryUpload(index)}
                className="absolute right-0 top-0 text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* File Preview with Type Icon */}
        {watch(`creativeAssets.${index}.url`) && (
          <div className="mt-2 relative">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileTypeIcon type={watch(`creativeAssets.${index}.type`)} />
              <span>Current file:</span>
            </div>
            <div className="relative group mt-2">
              {watch(`creativeAssets.${index}.type`) === 'image' ? (
                <img
                  src={watch(`creativeAssets.${index}.url`)}
                  alt="Preview"
                  className="max-h-32 object-contain rounded"
                />
              ) : (
                <video
                  src={watch(`creativeAssets.${index}.url`)}
                  className="max-h-32 rounded"
                  controls
                />
              )}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleFileDelete(index)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Status */}
        {attempt?.status === 'failed' && attempt.attempts >= maxRetries && (
          <p className="text-red-500 text-sm">
            Upload failed after {maxRetries} attempts. Please try again.
          </p>
        )}
      </div>
    )
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>
  if (!campaign) return <div className="p-8">Campaign not found</div>

  return (
    <>
      {/* Add Toaster component at the root */}
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-white p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Campaign: {campaign.campaignName}</h1>
          <div className="space-x-4">
            <Link 
              href={`/campaigns/${campaign.id}`}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Campaign Details */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Campaign Name
                  {errors.campaignName && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('campaignName')}
                  type="text"
                  className={`w-full p-2 border rounded ${
                    errors.campaignName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.campaignName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.campaignName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                  {errors.description && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className={`w-full p-2 border rounded ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                  {errors.startDate && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('startDate')}
                  type="date"
                  className={`w-full p-2 border rounded ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                  {errors.endDate && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('endDate')}
                  type="date"
                  className={`w-full p-2 border rounded ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Time Zone
                  {errors.timeZone && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  {...register('timeZone')}
                  className={`w-full p-2 border rounded ${
                    errors.timeZone ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Time Zone</option>
                  <option value="GMT">GMT (Greenwich Mean Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                  {/* Add more time zones as needed */}
                </select>
                {errors.timeZone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.timeZone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Currency
                  {errors.currency && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  {...register('currency')}
                  className={`w-full p-2 border rounded ${
                    errors.currency ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Currency</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                {errors.currency && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.currency.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Budget
                  {errors.totalBudget && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('totalBudget', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full p-2 border rounded ${
                    errors.totalBudget ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalBudget && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.totalBudget.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Social Media Budget
                  {errors.socialMediaBudget && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('socialMediaBudget', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full p-2 border rounded ${
                    errors.socialMediaBudget ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.socialMediaBudget && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.socialMediaBudget.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Influencer Handle
                </label>
                <input
                  {...register('influencerHandle')}
                  type="text"
                  className={`w-full p-2 border rounded ${
                    errors.influencerHandle ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.influencerHandle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.influencerHandle.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Primary Contact Section */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Primary Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                  {errors.primaryContact?.firstName && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('primaryContact.firstName')}
                  type="text"
                  className={`w-full p-2 border rounded ${
                    errors.primaryContact?.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.primaryContact?.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.primaryContact.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Surname
                  {errors.primaryContact?.surname && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('primaryContact.surname')}
                  type="text"
                  className={`w-full p-2 border rounded ${
                    errors.primaryContact?.surname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.primaryContact?.surname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.primaryContact.surname.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                  {errors.primaryContact?.email && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('primaryContact.email')}
                  type="email"
                  className={`w-full p-2 border rounded ${
                    errors.primaryContact?.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.primaryContact?.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.primaryContact.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Position
                  {errors.primaryContact?.position && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  {...register('primaryContact.position')}
                  className={`w-full p-2 border rounded ${
                    errors.primaryContact?.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Position</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                  <option value="VP">VP</option>
                  <option value="Other">Other</option>
                </select>
                {errors.primaryContact?.position && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.primaryContact.position.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Secondary Contact Section */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Secondary Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                  {errors.secondaryContact?.firstName && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('secondaryContact.firstName')}
                  type="text"
                  className={`w-full p-2 border rounded ${
                    errors.secondaryContact?.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.secondaryContact?.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.secondaryContact.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Surname
                  {errors.secondaryContact?.surname && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('secondaryContact.surname')}
                  type="text"
                  className={`w-full p-2 border rounded ${
                    errors.secondaryContact?.surname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.secondaryContact?.surname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.secondaryContact.surname.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                  {errors.secondaryContact?.email && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  {...register('secondaryContact.email')}
                  type="email"
                  className={`w-full p-2 border rounded ${
                    errors.secondaryContact?.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.secondaryContact?.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.secondaryContact.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Position
                  {errors.secondaryContact?.position && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <select
                  {...register('secondaryContact.position')}
                  className={`w-full p-2 border rounded ${
                    errors.secondaryContact?.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Position</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                  <option value="VP">VP</option>
                  <option value="Other">Other</option>
                </select>
                {errors.secondaryContact?.position && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.secondaryContact.position.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Objectives & KPIs */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Objectives & KPIs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary KPI</label>
                <select
                  {...register('primaryKPI')}
                  className="w-full p-2 border rounded"
                  required
                >
                  {/* Add KPI options */}
                </select>
              </div>
              {/* Add more objectives fields */}
            </div>
          </section>

          {/* Creative Assets */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Creative Assets</h2>
              <button
                type="button"
                onClick={addCreativeAsset}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Asset
              </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="creative-assets">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {watch('creativeAssets')?.map((_, index) => (
                      <Draggable
                        key={`asset-${index}`}
                        draggableId={`asset-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white p-4 rounded border"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move p-2"
                              >
                                ⋮⋮
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCreativeAsset(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                  Upload Asset
                                </label>
                                <FileUploadField index={index} />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Asset Type
                                  {errors.creativeAssets?.[index]?.type && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </label>
                                <select
                                  {...register(`creativeAssets.${index}.type`)}
                                  className={`w-full p-2 border rounded ${
                                    errors.creativeAssets?.[index]?.type ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Select Type</option>
                                  <option value="image">Image</option>
                                  <option value="video">Video</option>
                                  <option value="story">Story</option>
                                  <option value="reel">Reel</option>
                                </select>
                                {errors.creativeAssets?.[index]?.type && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors.creativeAssets[index]?.type?.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Title
                                  {errors.creativeAssets?.[index]?.title && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </label>
                                <input
                                  {...register(`creativeAssets.${index}.title`)}
                                  type="text"
                                  className={`w-full p-2 border rounded ${
                                    errors.creativeAssets?.[index]?.title ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {errors.creativeAssets?.[index]?.title && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors.creativeAssets[index]?.title?.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Description
                                </label>
                                <textarea
                                  {...register(`creativeAssets.${index}.description`)}
                                  className="w-full p-2 border rounded"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Influencer Assigned
                                </label>
                                <input
                                  {...register(`creativeAssets.${index}.influencerAssigned`)}
                                  type="text"
                                  className="w-full p-2 border rounded"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Influencer Handle
                                </label>
                                <input
                                  {...register(`creativeAssets.${index}.influencerHandle`)}
                                  type="text"
                                  className="w-full p-2 border rounded"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Budget
                                </label>
                                <input
                                  {...register(`creativeAssets.${index}.influencerBudget`, {
                                    valueAsNumber: true
                                  })}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-full p-2 border rounded"
                                />
                              </div>

                              <div>
                                <button
                                  type="button"
                                  onClick={() => setPreviewAsset(watch(`creativeAssets.${index}`))}
                                  className="text-blue-500 hover:text-blue-700 p-2"
                                >
                                  Preview
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </section>

          {/* Creative Requirements Section */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Creative Requirements</h2>
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Requirement
              </button>
            </div>

            <DragDropContext onDragEnd={onRequirementsDragEnd}>
              <Droppable droppableId="creative-requirements">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {watch('creativeRequirements')?.map((_, index) => (
                      <Draggable
                        key={`requirement-${index}`}
                        draggableId={`requirement-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white p-4 rounded border flex items-center gap-4"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move p-2"
                            >
                              ⋮⋮
                            </div>
                            
                            <div className="flex-grow">
                              <input
                                {...register(`creativeRequirements.${index}.requirement`)}
                                type="text"
                                placeholder="Enter requirement"
                                className={`w-full p-2 border rounded ${
                                  errors.creativeRequirements?.[index]?.requirement 
                                    ? 'border-red-500' 
                                    : 'border-gray-300'
                                }`}
                              />
                              {errors.creativeRequirements?.[index]?.requirement && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.creativeRequirements[index]?.requirement?.message}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeRequirement(index)}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </section>
        </form>

        {/* Asset Preview Modal */}
        {previewAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{previewAsset.title}</h3>
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="aspect-video bg-gray-100 mb-4">
                {previewAsset.type === 'image' ? (
                  <img
                    src={previewAsset.url}
                    alt={previewAsset.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={previewAsset.url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Type</p>
                  <p>{previewAsset.type}</p>
                </div>
                <div>
                  <p className="font-medium">Influencer</p>
                  <p>{previewAsset.influencerAssigned}</p>
                </div>
                <div>
                  <p className="font-medium">Handle</p>
                  <p>{previewAsset.influencerHandle}</p>
                </div>
                <div>
                  <p className="font-medium">Budget</p>
                  <p>{previewAsset.influencerBudget}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

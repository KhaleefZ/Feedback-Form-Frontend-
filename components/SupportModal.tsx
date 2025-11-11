'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
  userName: string;
}

export default function SupportModal({
  isOpen,
  onClose,
  userEmail,
  userId,
  userName,
}: SupportModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    contactNumber: '',
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Filter phone number to digits only
    if (name === 'contactNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, screenshot: 'Only JPEG, PNG, and GIF images are allowed' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, screenshot: 'File size must be less than 5MB' });
        return;
      }

      setScreenshot(file);
      // Create local URL for preview
      const url = URL.createObjectURL(file);
      setScreenshotUrl(url);
      if (errors.screenshot) {
        setErrors({ ...errors, screenshot: '' });
      }
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl);
      setScreenshotUrl('');
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    } else if (formData.subject.trim().length > 100) {
      newErrors.subject = 'Subject cannot exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadScreenshot = async (file: File): Promise<string> => {
    try {
      const response = await api.uploadFile(file);
      return response.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedScreenshotUrl = '';
      
      // Upload screenshot if provided
      if (screenshot) {
        uploadedScreenshotUrl = await uploadScreenshot(screenshot);
      }

      // Submit with logged-in user's email and user_id
      await api.submitSupportRequest({
        user_id: userId,
        email: userEmail, // Always use logged-in user's email
        subject: formData.subject,
        description: formData.description,
        contactNumber: formData.contactNumber,
        screenshot: uploadedScreenshotUrl,
      });
      
      setSubmitSuccess(true);
      // Don't auto-close, wait for user to click Done button
    } catch (error) {
      console.error('Error submitting support request:', error);
      setErrors({
        submit: 'Failed to submit support request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !submitSuccess) {
      onClose();
      setFormData({
        subject: '',
        description: '',
        contactNumber: '',
      });
      removeScreenshot();
      setErrors({});
      setSubmitSuccess(false);
    }
  };

  const handleSuccessClose = () => {
    onClose();
    setFormData({
      subject: '',
      description: '',
      contactNumber: '',
    });
    removeScreenshot();
    setErrors({});
    setSubmitSuccess(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={submitSuccess ? undefined : handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4 w-[calc(100vw-2rem)] sm:w-full modal-split">
        {submitSuccess ? (
          <>
            <button
              onClick={handleSuccessClose}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="sr-only">Close</span>
            </button>
            <div className="py-6 sm:py-8 px-4 sm:px-6 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Your support request has been submitted!
              </h3>
              <p className="text-sm text-gray-600 mb-6 sm:mb-8">
                Sit back and relax, our team will review your request and resolve your issue shortly.
              </p>
              <Button
                onClick={handleSuccessClose}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-2 text-sm sm:text-base"
              >
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <DialogTitle className="text-lg sm:text-xl">We&#39;re here to help!</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Share your issue in detail so we can resolve it quickly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4 px-4 sm:px-6">
              {errors.submit && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {errors.submit}
                </div>
              )}

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Type a short summary of your issue"
                  maxLength={100}
                  className={`text-sm sm:text-base ${errors.subject ? 'border-red-500' : ''}`}
                />
                {errors.subject && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.subject}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Describe your problem <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us what happened in detail"
                  rows={4}
                  maxLength={1000}
                  className={`text-sm sm:text-base resize-none ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="screenshot" className="text-sm font-medium">
                  Add Screenshot / File
                </Label>
                <div className="space-y-2">
                  {!screenshot ? (
                    <div className="border-2 border-dashed rounded-md p-4 sm:p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        id="screenshot"
                        name="screenshot"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="screenshot" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                          <svg
                            className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <div className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium text-primary">Drag & drop files here or click to browse</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="border rounded-md p-2 sm:p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-xs sm:text-sm font-medium truncate max-w-48">{screenshot.name}</p>
                            <p className="text-xs text-gray-500">
                              {(screenshot.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeScreenshot}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2"
                        >
                          <span className="text-xs sm:text-sm">Remove</span>
                        </Button>
                      </div>
                    </div>
                  )}
                  {errors.screenshot && (
                    <p className="text-xs sm:text-sm text-red-500">{errors.screenshot}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="contactNumber" className="text-sm font-medium">
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="w-16 sm:w-20">
                    <Input
                      value="+91"
                      disabled
                      className="bg-gray-100 cursor-not-allowed text-center text-sm"
                    />
                  </div>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Phone number"
                    maxLength={10}
                    className={`flex-1 text-sm sm:text-base ${errors.contactNumber ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.contactNumber && (
                  <p className="text-xs sm:text-sm text-red-500">{errors.contactNumber}</p>
                )}
              </div>

              <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                We&#39;ll reply to this support request at: <span className="font-medium">{userEmail}</span>
              </div>
            </div>

            <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6">
              <Button
                type="submit"
                className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { Internship } from '@/types';

interface AddInternshipFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (internship: Omit<Internship, 'id' | 'views' | 'applyClicks' | 'isStarred' | 'isViewed'>) => void;
  editingInternship?: Internship | null;
}

const availableMajors = [
  'Computer Science',
  'Mechanical Engineering', 
  'Business Administration',
  'Visual Communication',
  'Industrial Engineering',
  'Psychology',
  'International Relations',
  'Accounting'
];

const availableIndustries = [
  'Technology',
  'Finance',
  'Machinery',
  'Consulting',
  'Healthcare',
  'Education',
  'Marketing',
  'Manufacturing'
];

export const AddInternshipForm: React.FC<AddInternshipFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingInternship
}) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    duration: '',
    description: '',
    major: [] as string[],
    industry: [] as string[],
    applicationMethod: 'external' as 'external' | 'email',
    applicationValue: '',
    listingDuration: 6,
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Populate form when editing
  React.useEffect(() => {
    if (editingInternship) {
      setFormData({
        title: editingInternship.title,
        company: editingInternship.company,
        location: editingInternship.location,
        duration: editingInternship.duration,
        description: editingInternship.description,
        major: editingInternship.major,
        industry: editingInternship.industry,
        applicationMethod: editingInternship.applicationMethod,
        applicationValue: editingInternship.applicationValue,
        listingDuration: editingInternship.listingDuration || 6,
        imageUrl: editingInternship.imageUrl || ''
      });
      setImagePreview(editingInternship.imageUrl || '');
    }
  }, [editingInternship]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.location || !formData.duration || 
        !formData.description || formData.major.length === 0 || formData.industry.length === 0 || 
        !formData.applicationValue) {
      return;
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + formData.listingDuration);

    onSubmit({ ...formData, expiresAt });
    
    // Reset form
    setFormData({
      title: '',
      company: '',
      location: '',
      duration: '',
      description: '',
      major: [],
      industry: [],
      applicationMethod: 'external',
      applicationValue: '',
      listingDuration: 6,
      imageUrl: ''
    });
    setSelectedFile(null);
    setImagePreview('');
    
    onClose();
  };

  const handleMajorChange = (major: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        major: [...prev.major, major]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        major: prev.major.filter(m => m !== major)
      }));
    }
  };

  const handleIndustryChange = (industry: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        industry: [...prev.industry, industry]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        industry: prev.industry.filter(i => i !== industry)
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {editingInternship ? 'Edit Internship' : 'Add New Internship'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Internship Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Internship Title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company Name"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Location"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Duration"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Job Description"
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Filter Tagging */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Tagging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Required Majors *</Label>
                <p className="text-sm text-muted-foreground mb-3">Select all majors that are eligible for this internship</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableMajors.map((major) => (
                    <div key={major} className="flex items-center space-x-2">
                      <Checkbox
                        id={major}
                        checked={formData.major.includes(major)}
                        onCheckedChange={(checked) => handleMajorChange(major, checked as boolean)}
                      />
                      <Label htmlFor={major} className="text-sm">{major}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Industries *</Label>
                <p className="text-sm text-muted-foreground mb-3">Select all relevant industries for this internship</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableIndustries.map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={industry}
                        checked={formData.industry.includes(industry)}
                        onCheckedChange={(checked) => handleIndustryChange(industry, checked as boolean)}
                      />
                      <Label htmlFor={industry} className="text-sm">{industry}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Internship Flyer (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Upload Image</Label>
                <p className="text-sm text-muted-foreground mb-3">Add a flyer or promotional image for this internship</p>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Click to upload an image</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.applicationMethod}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  applicationMethod: value as 'external' | 'email',
                  applicationValue: '' 
                }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="external" id="external" />
                  <Label htmlFor="external">External Link</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Email Address</Label>
                </div>
              </RadioGroup>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="applicationValue">
                    {formData.applicationMethod === 'external' ? 'Application URL *' : 'Contact Email *'}
                  </Label>
                  <Input
                    id="applicationValue"
                    type={formData.applicationMethod === 'external' ? 'url' : 'email'}
                    value={formData.applicationValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationValue: e.target.value }))}
                    placeholder={formData.applicationMethod === 'external' 
                      ? 'Application URL' 
                      : 'Contact Email'
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="listingDuration">Listing Duration (months)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    How long should this internship remain active? (Default: 6 months)
                  </p>
                  <Input
                    id="listingDuration"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.listingDuration}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      listingDuration: parseInt(e.target.value) || 6 
                    }))}
                    placeholder="6"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 sticky bottom-0 bg-background p-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {editingInternship ? 'Update Internship' : 'Create Internship'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
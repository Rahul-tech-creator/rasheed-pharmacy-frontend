import React, { useState, useRef } from 'react'
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { usePharmacy } from '../../context/PharmacyContext'
import { useAuth } from '../../context/AuthContext'

const PrescriptionUpload = () => {
  const { uploadPrescription, loading } = usePharmacy()
  const { user } = useAuth()
  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    notes: ''
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(selectedFile.type)) {
      setError('Only JPEG, PNG, WebP and PDF files are allowed')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB')
      return
    }
    setFile(selectedFile)
    setError(null)
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setError('Please fill in your name and phone number')
      return
    }

    const formData = new FormData()
    formData.append('customer_name', form.customer_name.trim())
    formData.append('customer_phone', form.customer_phone.trim())
    if (form.notes.trim()) formData.append('notes', form.notes.trim())
    if (file) formData.append('prescription_file', file)

    try {
      const result = await uploadPrescription(formData)
      setSuccess(result)
      setFile(null)
      setPreview(null)
      setForm(f => ({ ...f, notes: '' }))
    } catch (err) {
      setError(err.message || 'Failed to upload prescription')
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Upload Prescription</h2>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        Upload your prescription and we'll prepare your medicines for pickup.
      </p>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <div>
            <strong>Prescription uploaded successfully!</strong>
            <p style={{ marginTop: '0.25rem' }}>Your Order ID is <strong>#{success.id}</strong>. Track the status in the "Track Order" tab.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Your Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={form.customer_name}
              onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))}
              required
              readOnly={!!user?.name}
              style={user?.name ? { background: 'var(--border-light)', cursor: 'default' } : {}}
            />
            {user?.name && <span className="form-hint">Auto-filled from your account</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={form.customer_phone}
              onChange={(e) => setForm(f => ({ ...f, customer_phone: e.target.value }))}
              required
              readOnly={!!user?.phone}
              style={user?.phone ? { background: 'var(--border-light)', cursor: 'default' } : {}}
            />
            {user?.phone && <span className="form-hint">Auto-filled from your account</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Prescription Image</label>
          <div
            className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="upload-icon" size={40} />
            <p><strong>Click to upload</strong> or drag and drop</p>
            <p className="file-types">JPEG, PNG, WebP or PDF (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>

          {file && (
            <div className="file-preview">
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <div style={{
                  width: '60px', height: '60px', borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={24} className="text-primary" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{file.name}</p>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null) }}
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea
            className="form-textarea"
            placeholder="Any additional notes for the pharmacist..."
            value={form.notes}
            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading.uploadPrescription}
          style={{ marginTop: '0.5rem' }}
        >
          {loading.uploadPrescription ? (
            <><div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} /> Uploading...</>
          ) : (
            <><Upload size={20} /> Submit Prescription</>
          )}
        </button>
      </form>
    </div>
  )
}

export default PrescriptionUpload

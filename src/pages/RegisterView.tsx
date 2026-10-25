import { useState, useEffect, FC, ReactNode, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, User } from '../types/auth';
import {
  Users,
  Bus,
  Building2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Mail,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  verifyEmailApi,
  resendVerificationEmailApi,
  saveOnboardingApi,
  uploadAccountDocumentApi,
  createStudentApi,
} from '../services/api';

interface RegisterViewProps {
  initialRole?: UserRole;
  onSwitchToLogin: () => void;
  onSuccess: (user?: User) => void;
}

interface RoleChoice {
  role: UserRole;
  label: string;
  description: string;
  icon: ReactNode;
}

const PUBLIC_ROLES: RoleChoice[] = [
  {
    role: 'PARENT',
    label: 'Parent / Guardian',
    description: 'Find verified school routes, request seats, and track children safely.',
    icon: <Users size={20} />,
  },
  {
    role: 'TRANSPORT_PROVIDER',
    label: 'Transport Provider / Vehicle Owner',
    description: 'Register vehicles, define routes, manage seat bookings, and conduct daily trips.',
    icon: <Bus size={20} />,
  },
  {
    role: 'BUSINESS',
    label: 'Business / Advertiser',
    description: 'Advertise automotive, insurance, or family services to school communities.',
    icon: <Building2 size={20} />,
  },
];

type StepNumber = 1 | 2 | 3 | 4;

export const RegisterView: FC<RegisterViewProps> = ({
  initialRole = 'PARENT',
  onSwitchToLogin,
  onSuccess,
}) => {
  const { user, register, clearError, refreshUser } = useAuth();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);

  // Step 1: Basic Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [submittingStep1, setSubmittingStep1] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: Real Email Verification
  const [emailCodeInput, setEmailCodeInput] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [checkingEmailStatus, setCheckingEmailStatus] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailNotice, setEmailNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isEmailVerifiedLocally, setIsEmailVerifiedLocally] = useState(false);


  // Step 4A: Parent Information
  const [parentAddress, setParentAddress] = useState('');
  const [parentEmergencyPhone, setParentEmergencyPhone] = useState('');
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childSchool, setChildSchool] = useState('');
  const [childGrade, setChildGrade] = useState('');

  // Step 4B: Transport Provider Information
  const [providerBusinessName, setProviderBusinessName] = useState('');
  const [providerLicenseNumber, setProviderLicenseNumber] = useState('');
  const [providerServiceArea, setProviderServiceArea] = useState('');
  const [providerLicenseFile, setProviderLicenseFile] = useState<File | null>(null);
  const [providerVehiclePlate, setProviderVehiclePlate] = useState('');
  const [providerVehicleCapacity, setProviderVehicleCapacity] = useState('14');
  const [providerRegDocFile, setProviderRegDocFile] = useState<File | null>(null);
  const [providerInsuranceDocFile, setProviderInsuranceDocFile] = useState<File | null>(null);

  // Step 4C: Business / Advertiser Information
  const [bizName, setBizName] = useState('');
  const [bizContactPerson, setBizContactPerson] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizRegNumber, setBizRegNumber] = useState('');
  const [bizRegDocFile, setBizRegDocFile] = useState<File | null>(null);
  const [bizTaxDocFile, setBizTaxDocFile] = useState<File | null>(null);

  // Step 4 Submission Status
  const [submittingStep4, setSubmittingStep4] = useState(false);
  const [step4Error, setStep4Error] = useState<string | null>(null);
  const [step4Success, setStep4Success] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Check if current user is already logged in and at an advanced step
  useEffect(() => {
    if (user && currentStep === 1) {
      if (user.role) setRole(user.role);
      if (user.firstName) setFirstName(user.firstName);
      if (user.lastName) setLastName(user.lastName);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone || '');
      if (user.isEmailVerified) setIsEmailVerifiedLocally(true);
      setCurrentStep(2);
    }
  }, [user]);

  // -------------------------------------------------------------
  // Step 1: Submit Basic Information
  // -------------------------------------------------------------
  const handleStep1Submit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setStep1Error(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (trimmedFirst.length < 2) {
      setStep1Error('First name must be at least 2 characters.');
      return;
    }
    if (trimmedLast.length < 2) {
      setStep1Error('Last name must be at least 2 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStep1Error('Please enter a valid email address.');
      return;
    }

    if (trimmedPhone) {
      const phoneDigits = trimmedPhone.replace(/[^0-9]/g, '');
      if (phoneDigits.length < 9) {
        setStep1Error('Please enter a valid phone number (at least 9 digits).');
        return;
      }
    }

    if (password.length < 8) {
      setStep1Error('Password must contain at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setStep1Error('Password must contain at least 1 uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setStep1Error('Password must contain at least 1 lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setStep1Error('Password must contain at least 1 number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setStep1Error('Password must contain at least 1 special character (!@#$%^&*).');
      return;
    }

    if (password !== confirmPassword) {
      setStep1Error('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    // Role safety check
    if (role === ('ADMIN' as any) || role === ('SUPER_ADMIN' as any) || role === ('SCHOOL_ADMIN' as any)) {
      setStep1Error('Administrator roles cannot be registered through the public portal.');
      return;
    }

    try {
      setSubmittingStep1(true);
      await register({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
        password,
        role,
      });

      setEmailNotice({
        type: 'info',
        text: `A verification link has been sent to ${trimmedEmail}. Please verify your email to unlock all features.`,
      });
      setCurrentStep(2);
    } catch (err: any) {
      setStep1Error(err.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmittingStep1(false);
    }
  };

  // -------------------------------------------------------------
  // Step 2: Email Verification (Auto-polling + 6-digit Code + Button Click)
  // -------------------------------------------------------------
  // Auto-poll verification status while user is on Step 2
  useEffect(() => {
    if (currentStep !== 2 || isEmailVerifiedLocally || user?.isEmailVerified) return;

    const interval = setInterval(async () => {
      try {
        const updated = await refreshUser();
        if (updated?.isEmailVerified) {
          setIsEmailVerifiedLocally(true);
          setEmailNotice({
            type: 'success',
            text: 'Email verified successfully! Advancing to Profile Setup...',
          });
          setTimeout(() => setCurrentStep(3), 1200);
        }
      } catch (_e) {
        // Silent poll error
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentStep, isEmailVerifiedLocally, user?.isEmailVerified, refreshUser]);

  const handleCheckEmailVerificationStatus = async () => {
    try {
      setCheckingEmailStatus(true);
      setEmailNotice(null);
      const updated = await refreshUser();
      if (updated?.isEmailVerified) {
        setIsEmailVerifiedLocally(true);
        setEmailNotice({
          type: 'success',
          text: 'Email verified successfully! Advancing to Profile Setup...',
        });
        setTimeout(() => setCurrentStep(3), 1000);
      } else {
        setEmailNotice({
          type: 'info',
          text: 'Verification not detected yet. Please make sure you clicked the "Verify Email Address" button in your email, or enter the 6-digit code below.',
        });
      }
    } catch (_err) {
      setEmailNotice({
        type: 'error',
        text: 'Could not refresh account status. Please try again or enter the 6-digit code.',
      });
    } finally {
      setCheckingEmailStatus(false);
    }
  };

  const handleVerifyEmailCode = async (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = emailCodeInput.trim().replace(/[^0-9]/g, '');
    if (cleanCode.length !== 6) {
      setEmailNotice({ type: 'error', text: 'Please enter the complete 6-digit verification code.' });
      return;
    }

    try {
      setVerifyingEmail(true);
      setEmailNotice(null);
      const res = await verifyEmailApi(cleanCode);
      setIsEmailVerifiedLocally(true);
      setEmailNotice({ type: 'success', text: res.message || 'Email verified successfully!' });
      await refreshUser();
      setTimeout(() => {
        setCurrentStep(3);
      }, 1200);
    } catch (err: any) {
      setEmailNotice({
        type: 'error',
        text: err.response?.data?.message || 'Invalid or expired 6-digit verification code.',
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      setResendingEmail(true);
      setEmailNotice(null);
      const targetEmail = user?.email || email.trim();
      const res = await resendVerificationEmailApi(targetEmail);
      if (res.delivered === false) {
        setEmailNotice({
          type: 'info',
          text: 'Notice: Outbound SMTP email service is currently pending production configuration. You can proceed with your application.',
        });
      } else {
        setEmailNotice({
          type: 'success',
          text: res.message || 'A fresh verification link and code have been sent to your email address.',
        });
      }
      setResendCooldown(60);
    } catch (err: any) {
      setEmailNotice({
        type: 'error',
        text: err.response?.data?.message || 'Could not resend verification email. Please try again later.',
      });
    } finally {
      setResendingEmail(false);
    }
  };


  // -------------------------------------------------------------
  // Step 4: Role-Specific Completion & Document Uploads
  // -------------------------------------------------------------
  const handleStep4Submit = async (e: FormEvent) => {
    e.preventDefault();
    setStep4Error(null);
    setStep4Success(null);
    setSubmittingStep4(true);

    try {
      if (role === 'PARENT') {
        // Save parent onboarding address
        await saveOnboardingApi({
          serviceArea: parentAddress.trim() || undefined,
          phone: parentEmergencyPhone.trim() || undefined,
          registrationStep: 'STEP_4_COMPLETED',
        });

        // Register child if provided
        if (childFirstName.trim() && childLastName.trim() && childSchool.trim()) {
          await createStudentApi({
            firstName: childFirstName.trim(),
            lastName: childLastName.trim(),
            schoolName: childSchool.trim(),
            grade: childGrade.trim() || undefined,
            homeAddress: parentAddress.trim() || undefined,
            emergencyPhone: parentEmergencyPhone.trim() || undefined,
          });
        }

        setStep4Success('Parent profile and children details registered successfully!');
        await refreshUser();
        setTimeout(() => {
          setCurrentStep(4);
        }, 800);
      } else if (role === 'TRANSPORT_PROVIDER') {
        // Validation: must have business/operator name and license
        if (!providerBusinessName.trim() || !providerLicenseNumber.trim()) {
          setStep4Error('Operator legal name and commercial driver license number are required.');
          setSubmittingStep4(false);
          return;
        }

        // Required: Driver's license document must be uploaded
        if (!providerLicenseFile) {
          setStep4Error('Commercial Driver License document upload is required for provider verification.');
          setSubmittingStep4(false);
          return;
        }

        // Save onboarding details
        await saveOnboardingApi({
          businessName: providerBusinessName.trim(),
          licenseNumber: providerLicenseNumber.trim(),
          serviceArea: providerServiceArea.trim() || undefined,
          registrationStep: 'STEP_4_COMPLETED',
        });

        // Upload driver license document (required)
        const form = new FormData();
        form.append('document', providerLicenseFile);
        form.append('documentType', 'DRIVER_LICENSE');
        form.append('documentName', 'Commercial Driver License');
        await uploadAccountDocumentApi(form);

        // Upload vehicle registration document if provided
        if (providerRegDocFile) {
          const form = new FormData();
          form.append('document', providerRegDocFile);
          form.append('documentType', 'VEHICLE_REGISTRATION');
          form.append('documentName', `Vehicle Registration (${providerVehiclePlate || 'Transport'})`);
          await uploadAccountDocumentApi(form);
        }

        // Upload insurance document if provided
        if (providerInsuranceDocFile) {
          const form = new FormData();
          form.append('document', providerInsuranceDocFile);
          form.append('documentType', 'INSURANCE');
          form.append('documentName', 'Commercial Passenger Insurance');
          await uploadAccountDocumentApi(form);
        }

        setStep4Success('Provider application and verification documents submitted!');
        await refreshUser();
        setTimeout(() => {
          setCurrentStep(4);
        }, 800);
      } else if (role === 'BUSINESS') {
        if (!bizName.trim() || !bizContactPerson.trim()) {
          setStep4Error('Business name and primary contact person are required.');
          setSubmittingStep4(false);
          return;
        }

        // Required: Business registration certificate must be uploaded
        if (!bizRegDocFile) {
          setStep4Error('Official Business Registration Certificate document upload is required for verification.');
          setSubmittingStep4(false);
          return;
        }

        await saveOnboardingApi({
          businessName: bizName.trim(),
          licenseNumber: bizRegNumber.trim() || undefined,
          serviceArea: bizAddress.trim() || undefined,
          phone: bizPhone.trim() || undefined,
          registrationStep: 'STEP_4_COMPLETED',
        });

        const form = new FormData();
        form.append('document', bizRegDocFile);
        form.append('documentType', 'BUSINESS_REGISTRATION');
        form.append('documentName', 'Business Registration Certificate');
        await uploadAccountDocumentApi(form);

        if (bizTaxDocFile) {
          const form = new FormData();
          form.append('document', bizTaxDocFile);
          form.append('documentType', 'TAX_CERTIFICATE');
          form.append('documentName', 'TIN / Tax Clearance Document');
          await uploadAccountDocumentApi(form);
        }

        setStep4Success('Business registration and credentials submitted for review!');
        await refreshUser();
        setTimeout(() => {
          setCurrentStep(4);
        }, 800);
      }
    } catch (err: any) {
      setStep4Error(err.response?.data?.message || err.message || 'Failed to submit onboarding information.');
    } finally {
      setSubmittingStep4(false);
    }
  };

  // Step Progress Bar Labels
  const stepLabels = [
    { num: 1, title: 'Basics' },
    { num: 2, title: 'Email' },
    { num: 3, title: role === 'PARENT' ? 'Child Info' : role === 'BUSINESS' ? 'Business' : 'Operator' },
    { num: 4, title: 'Complete' },
  ];

  return (
    <div className="auth-box" style={{ maxWidth: '640px', width: '100%', padding: '2.5rem' }}>
      {/* Wizard Brand Header */}
      <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
        <div className="auth-brand-logo-wrap">
          <img src="/logo-shield.png" alt="SchoolSafe Logo" className="auth-logo-img" />
        </div>
        <h2 style={{ fontSize: '1.65rem' }}>
          {currentStep === 1 && 'Create Your SchoolSafe Account'}
          {currentStep === 2 && 'Verify Your Email Address'}
          {currentStep === 3 && (role === 'PARENT' ? 'Parent & Student Profile' : role === 'BUSINESS' ? 'Business & Advertising Profile' : 'Transport Operator & Fleet Details')}
          {currentStep === 4 && 'Registration Complete'}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {currentStep === 1 && 'Step 1 of 4: Secure platform registration and account setup.'}
          {currentStep === 2 && 'Step 2 of 4: Confirm access to your registered email.'}
          {currentStep === 3 && 'Step 3 of 4: Role-specific profile details and setup.'}
          {currentStep === 4 && 'Step 4 of 4: Final review and dashboard activation.'}
        </p>
      </div>

      {/* Progress Bar Indicator */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '0.5rem' }}>
          {/* Progress bar background line */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              right: '20px',
              height: '3px',
              backgroundColor: 'var(--color-border)',
              zIndex: 0,
            }}
          />
          {/* Progress bar fill line */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              width: `${((currentStep - 1) / 3) * 88}%`,
              height: '3px',
              backgroundColor: 'var(--color-accent)',
              transition: 'width 0.3s ease',
              zIndex: 1,
            }}
          />

          {stepLabels.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--color-success)' : isCurrent ? 'var(--color-accent)' : '#FFFFFF',
                    border: `2px solid ${isCompleted ? 'var(--color-success)' : isCurrent ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    color: isCompleted || isCurrent ? '#FFFFFF' : 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    transition: 'all 0.25s ease',
                  }}
                >
                  {isCompleted ? <Check size={16} /> : s.num}
                </div>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    marginTop: '0.35rem',
                  }}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STEP 1: Basic Information */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 1 && (
        <form onSubmit={handleStep1Submit} className="auth-form">
          {step1Error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{step1Error}</span>
            </div>
          )}

          {/* Role Selection */}
          <div className="form-group">
            <label style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Select Your Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
              {PUBLIC_ROLES.map((r) => {
                const isSelected = role === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => setRole(r.role)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-accent-light)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'var(--color-accent)' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {r.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.925rem',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                        }}
                      >
                        {r.label}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                        {r.description}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="role-selector"
                      checked={isSelected}
                      onChange={() => setRole(r.role)}
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label htmlFor="reg-first-name">First Name *</label>
              <input
                id="reg-first-name"
                className="form-input"
                type="text"
                placeholder="e.g. Sara"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-last-name">Last Name *</label>
              <input
                id="reg-last-name"
                className="form-input"
                type="text"
                placeholder="e.g. Bekele"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address *</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              placeholder="e.g. sara@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">Phone Number (Ethiopian format supported)</label>
            <input
              id="reg-phone"
              className="form-input"
              type="tel"
              placeholder="e.g. +251 91 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password *</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {/* Password security criteria */}
            <div
              style={{
                marginTop: '0.35rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {[
                { label: 'At least 8 characters', met: password.length >= 8 },
                { label: 'At least 1 uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
                { label: 'At least 1 lowercase letter (a-z)', met: /[a-z]/.test(password) },
                { label: 'At least 1 number (0-9)', met: /[0-9]/.test(password) },
                { label: 'At least 1 special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
              ].map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: rule.met ? '#16A34A' : password.length > 0 ? '#DC2626' : '#64748B',
                    fontWeight: rule.met ? 600 : 400,
                  }}
                >
                  {rule.met ? (
                    <Check size={13} style={{ color: '#16A34A' }} />
                  ) : (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: password.length > 0 ? '#DC2626' : '#94A3B8',
                        display: 'inline-block',
                      }}
                    />
                  )}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm-password">Confirm Password *</label>
            <input
              id="reg-confirm-password"
              className="form-input"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Passwords do not match
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submittingStep1}
            style={{ width: '100%', marginTop: '0.5rem', gap: '0.5rem' }}
          >
            {submittingStep1 ? (
              <>
                <Loader2 size={16} className="spin-animation" /> Creating Account...
              </>
            ) : (
              <>
                Continue to Email Verification <ArrowRight size={16} />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{ color: 'var(--color-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign In
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 2: Real Email Verification */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header notification card */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#DBEAFE',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mail size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>
                Verification Email Dispatched
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                We sent a secure verification email to:
                <br />
                <strong style={{ color: 'var(--color-text-main)', fontSize: '0.95rem' }}>{user?.email || email}</strong>
              </div>
            </div>
          </div>

          {emailNotice && (
            <div
              className={`alert ${
                emailNotice.type === 'success'
                  ? 'alert-success'
                  : emailNotice.type === 'error'
                  ? 'alert-danger'
                  : 'alert-info'
              }`}
            >
              {emailNotice.type === 'success' ? (
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
              )}
              <span>{emailNotice.text}</span>
            </div>
          )}

          {isEmailVerifiedLocally || user?.isEmailVerified ? (
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-success-light)',
                border: '1.5px solid #86EFAC',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                color: 'var(--color-success)',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              <CheckCircle2 size={28} />
              <div>Your email address is officially verified! Advancing...</div>
            </div>
          ) : (
            <>
              {/* Option 1: One-Click Email Link Button Check */}
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
                  Option 1: Click the Link in Your Email
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                  Open the email we sent you and click the <strong>Verify Email Address</strong> button. Once clicked, this page will automatically advance.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={checkingEmailStatus}
                    onClick={handleCheckEmailVerificationStatus}
                    style={{ gap: '0.5rem' }}
                  >
                    {checkingEmailStatus ? <Loader2 size={16} className="spin-animation" /> : <CheckCircle2 size={16} />}
                    I Clicked the Link in My Email
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={resendingEmail || resendCooldown > 0}
                    onClick={handleResendVerification}
                  >
                    {resendingEmail
                      ? 'Resending...'
                      : resendCooldown > 0
                      ? `Resend Email (${resendCooldown}s)`
                      : 'Resend Email'}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.25rem 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Or Enter 6-Digit Code
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              </div>

              {/* Option 2: 6-Digit Code Entry */}
              <form onSubmit={handleVerifyEmailCode} className="auth-form" style={{ marginTop: 0 }}>
                <div className="form-group" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <label htmlFor="email-code-input" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    id="email-code-input"
                    className="form-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={emailCodeInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setEmailCodeInput(val);
                    }}
                    style={{
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      letterSpacing: '8px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      padding: '0.65rem',
                      maxWidth: '220px',
                      margin: '0 auto',
                      display: 'block',
                    }}
                  />
                  <span className="form-hint" style={{ marginTop: '0.4rem', display: 'block' }}>
                    Check your email inbox or spam folder for your 6-digit code.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={verifyingEmail || emailCodeInput.length !== 6}
                    style={{ minWidth: '180px', gap: '0.4rem', justifyContent: 'center' }}
                  >
                    {verifyingEmail ? <Loader2 size={16} className="spin-animation" /> : <CheckCircle2 size={16} />}
                    Verify Code
                  </button>
                </div>
              </form>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setCurrentStep(1)}
              style={{ gap: '0.35rem' }}
            >
              <ArrowLeft size={16} /> Back to Basics
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentStep(3)}
              style={{ gap: '0.4rem' }}
            >
              Next: Profile Details <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 3: Role-Specific Completion & Document Uploads */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 3 && (
        <form onSubmit={handleStep4Submit} className="auth-form">
          {step4Error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{step4Error}</span>
            </div>
          )}
          {step4Success && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{step4Success}</span>
            </div>
          )}

          {/* 4A: Parent Registration Completion */}
          {role === 'PARENT' && (
            <>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                Parent / Guardian Contact & Student Information
              </div>

              <div className="form-group">
                <label>Home Pickup Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bole Medhanealem, Addis Ababa"
                  value={parentAddress}
                  onChange={(e) => setParentAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +251 91 123 4567"
                  value={parentEmergencyPhone}
                  onChange={(e) => setParentEmergencyPhone(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  Register Your First Child (Optional - can also be added later)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Child First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Maya"
                      value={childFirstName}
                      onChange={(e) => setChildFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Child Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Bekele"
                      value={childLastName}
                      onChange={(e) => setChildLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div className="form-group">
                    <label>School Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cambridge Academy"
                      value={childSchool}
                      onChange={(e) => setChildSchool(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Grade / Year</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Grade 5"
                      value={childGrade}
                      onChange={(e) => setChildGrade(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 4B: Transport Provider / Vehicle Owner Information */}
          {role === 'TRANSPORT_PROVIDER' && (
            <>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '0.85rem', color: '#1E40AF' }}>
                <strong>Transport Provider Application:</strong> Submit your operator details and documents for administrator review. Your account will be evaluated before commercial transit services are activated.
              </div>

              <div className="form-group">
                <label>Business / Operator Legal Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. SafeTransit Addis Ababa PLC"
                  value={providerBusinessName}
                  onChange={(e) => setProviderBusinessName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Driver License Number *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. DL-ETH-982104"
                    value={providerLicenseNumber}
                    onChange={(e) => setProviderLicenseNumber(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Primary Service Area</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bole, Kazanchis, CMC"
                    value={providerServiceArea}
                    onChange={(e) => setProviderServiceArea(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Commercial Driver's License Document <strong style={{ color: '#DC2626' }}>* (Required)</strong></span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>PDF, JPEG, PNG</span>
                </label>
                <input
                  type="file"
                  required
                  accept="application/pdf,image/jpeg,image/png"
                  className="form-input"
                  onChange={(e) => setProviderLicenseFile(e.target.files?.[0] || null)}
                />
                {providerLicenseFile && (
                  <div style={{ fontSize: '0.78rem', color: '#16A34A', marginTop: '0.35rem', fontWeight: 500 }}>
                    ✓ Selected: {providerLicenseFile.name} ({(providerLicenseFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  Primary Vehicle Details
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Vehicle License Plate</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 3-A2849"
                      value={providerVehiclePlate}
                      onChange={(e) => setProviderVehiclePlate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Seating Capacity</label>
                    <input
                      type="number"
                      min={1}
                      max={70}
                      className="form-input"
                      value={providerVehicleCapacity}
                      onChange={(e) => setProviderVehicleCapacity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>Vehicle Registration / Inspection Certificate</label>
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    className="form-input"
                    onChange={(e) => setProviderRegDocFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="form-group">
                  <label>Passenger Insurance Document</label>
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    className="form-input"
                    onChange={(e) => setProviderInsuranceDocFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </>
          )}

          {/* 4C: Business / Advertiser Information */}
          {role === 'BUSINESS' && (
            <>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FCD34D', fontSize: '0.85rem', color: '#92400E' }}>
                <strong>Business Verification:</strong> Provide your organization details. Administrator review is required before ad campaigns can be published publicly.
              </div>

              <div className="form-group">
                <label>Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Ethio Automotive Services"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Contact Person *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Dawit Tadesse"
                    value={bizContactPerson}
                    onChange={(e) => setBizContactPerson(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Business Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +251 11 555 1234"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Operating Address / City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bole Sub-city, Woreda 03, Addis Ababa"
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tax Identification / Registration Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. TIN-001928374"
                  value={bizRegNumber}
                  onChange={(e) => setBizRegNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Business Registration Certificate <strong style={{ color: '#DC2626' }}>* (Required)</strong></span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>PDF, JPEG, PNG</span>
                </label>
                <input
                  type="file"
                  required
                  accept="application/pdf,image/jpeg,image/png"
                  className="form-input"
                  onChange={(e) => setBizRegDocFile(e.target.files?.[0] || null)}
                />
                {bizRegDocFile && (
                  <div style={{ fontSize: '0.78rem', color: '#16A34A', marginTop: '0.35rem', fontWeight: 500 }}>
                    ✓ Selected: {bizRegDocFile.name} ({(bizRegDocFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Upload Tax / TIN Clearance Certificate</label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="form-input"
                  onChange={(e) => setBizTaxDocFile(e.target.files?.[0] || null)}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setCurrentStep(2)}
              style={{ gap: '0.35rem' }}
            >
              <ArrowLeft size={16} /> Back to Email
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submittingStep4}
              style={{ gap: '0.5rem' }}
            >
              {submittingStep4 ? (
                <>
                  <Loader2 size={16} className="spin-animation" /> Submitting...
                </>
              ) : (
                <>
                  Submit Application <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 4: Submission & Status Summary */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: user?.status === 'ACTIVE' ? 'var(--color-success-light)' : '#FEF3C7',
              color: user?.status === 'ACTIVE' ? 'var(--color-success)' : '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            {user?.status === 'ACTIVE' ? <CheckCircle2 size={36} /> : <Clock size={36} />}
          </div>

          <div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              {user?.status === 'ACTIVE'
                ? 'Welcome to SchoolSafe!'
                : role === 'PARENT'
                ? 'Parent Registration Submitted'
                : role === 'TRANSPORT_PROVIDER'
                ? 'Operator Application Received'
                : 'Business Account Submitted'}
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
              {user?.status === 'ACTIVE' ? (
                'Your account has been approved and activated. You can now search for verified transportation routes, manage your children, and request safe daily commutes.'
              ) : role === 'PARENT' ? (
                'Your parent account has been successfully registered and is pending administrator review and approval. An administrator will review your account before full access is activated.'
              ) : role === 'TRANSPORT_PROVIDER' ? (
                'Your driver and vehicle documents have been uploaded to our secure document repository. A SchoolSafe administrator will review your application. Unapproved providers cannot publish active routes until approved.'
              ) : (
                'Your business profile and registration documents have been submitted. Once approved by our team, you will be able to create and launch sponsored campaigns.'
              )}
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Account Email:</span>
              <span style={{ fontWeight: 600 }}>{user?.email || email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Account Type:</span>
              <span style={{ fontWeight: 600 }}>
                {role === 'PARENT'
                  ? 'Parent / Guardian'
                  : role === 'TRANSPORT_PROVIDER'
                  ? 'Transport Provider / Driver'
                  : 'Business / Advertiser'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Approval Status:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: user?.status === 'ACTIVE' ? 'var(--color-success)' : '#D97706',
                }}
              >
                {user?.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_ADMIN_REVIEW'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => onSuccess(user || undefined)}
            style={{ width: '100%', gap: '0.5rem', justifyContent: 'center' }}
          >
            Go to My Dashboard <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
export default RegisterView;

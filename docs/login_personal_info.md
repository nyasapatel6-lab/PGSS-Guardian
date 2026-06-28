# Login - Personal Information Form

## Overview
The Personal Information form is the first step in the PGSS Guardian onboarding process. This form collects essential health and demographic data required for the fall detection and vital monitoring system to function accurately.

## Form Fields

### Personal Information Section

#### Full Name *
- **Type**: Text input
- **Required**: Yes
- **Description**: User's complete name
- **Example**: Arjun Sharma

#### Age *
- **Type**: Number input
- **Required**: Yes
- **Description**: User's age in years
- **Example**: 25

#### Gender
- **Type**: Single selection buttons
- **Required**: No
- **Options**:
  - Male
  - Female
  - Other

#### Height (cm) *
- **Type**: Number input
- **Required**: Yes
- **Description**: User's height in centimeters
- **Example**: 170

#### Weight (kg) *
- **Type**: Number input
- **Required**: Yes
- **Description**: User's weight in kilograms
- **Example**: 65

#### Blood Group
- **Type**: Single selection buttons
- **Required**: No
- **Options**:
  - A+
  - A-
  - B+
  - B-
  - AB+
  - AB-
  - O+
  - O-

## Purpose

This personal information serves multiple purposes in the PGSS Guardian system:

1. **Fall Detection Calibration**: Height and weight data help calibrate accelerometers for accurate fall detection
2. **Emergency Medical Information**: Blood group and demographics are shared with emergency responders
3. **User Identification**: Full name and age provide clear identification in emergency situations
4. **Health Monitoring**: Personal metrics establish baseline vital signs for monitoring

## Next Steps

After completing this form, users proceed to the next onboarding step by clicking the **"Continue →"** button.

## UI Design Notes

- Dark theme with red accent color (#E63946 or similar)
- Clear visual hierarchy with section headers
- Form validation required for mandatory fields (marked with *)
- Blood group selection shows A+ as the default selected option in the mockup
- Continue button spans full width at the bottom

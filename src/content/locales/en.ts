import type { IdMessages } from '@/content/locales/id';

/**
 * English message catalog.
 *
 * The type annotation forces exact key parity with `id.ts`: a missing or extra key is a
 * type error, not a runtime fallback to a raw key or to Indonesian (CONVENTIONS.md 13.3).
 *
 * Safety-critical wording keeps its scoped meaning. "Found in the source checked" must not
 * become "official", "not yet verified" must not become "suspicious", and nothing here may
 * strengthen a status into a safety or fraud verdict (DATA_SOURCES.md 12).
 */
export const enMessages: Record<keyof IdMessages, string> = {
  // ---------------------------------------------------------------- app shell
  'app.name': 'MigranShield',
  'app.tagline': 'Check the evidence before you pay',
  'app.description':
    'MigranShield helps you break down the claims in an overseas job offer and shows what you still need to verify.',
  'app.skip_to_content': 'Skip to main content',
  'app.language_picker': 'Pilih bahasa / Choose language',
  'app.language_selected': 'Active language: {language}',
  'app.language_indonesian': 'Indonesian',
  'app.language_english': 'English',
  'app.back': 'Back',
  'app.demo_badge': 'Prototype example result',
  'app.demo_badge_short': 'Prototype example',

  'nav.home': 'Home',
  'nav.check': 'Check',
  'nav.learn': 'Practice',
  'nav.history': 'History',
  'nav.label': 'Main navigation',

  // ---------------------------------------------------------------- statuses
  'status.source_match': 'Matches the source checked',
  'status.unverified': 'Not yet verified',
  'status.mismatch': 'Does not match',
  'status.risk_indicator': 'Risk indicator found',

  'method.exact': 'Exact comparison',
  'method.normalized': 'Comparison after format normalization',
  'method.partial': 'Partial comparison',
  'method.manual': 'Needs manual checking',
  'method.rule_based': 'Rule-based',

  'tier.official_primary': 'Primary official record',
  'tier.official_guidance': 'Official guidance or channel',
  'tier.user_provided': 'Information from the user',
  'tier.community_signal': 'Community report',

  'category.company': 'Company / P3MI',
  'category.contact': 'Contact identity and channel',
  'category.vacancy': 'Vacancy',
  'category.contract': 'Contract',
  'category.visa': 'Visa',
  'category.payment': 'Fees and payment',
  'category.time_pressure': 'Time pressure',

  // ---------------------------------------------------------------- sources
  'source.user_information': 'Information from the user',
  'source.unknown': 'Unknown source',
  'source.siskop2mi_p3mi.name': 'SISKOP2MI — P3MI list',
  'source.siskop2mi_p3mi.purpose': 'Identity and details of placement companies.',
  'source.siskop2mi_p3mi.limitation':
    'A registered company does not prove that the person contacting you represents it.',
  'source.siskop2mi_sanctions.name': 'SISKOP2MI — administrative sanctions',
  'source.siskop2mi_sanctions.purpose':
    'Administrative-sanction status of placement companies.',
  'source.siskop2mi_sanctions.limitation':
    'Status changes over time. The retrieval date always matters.',
  'source.siskop2mi_vacancies.name': 'SISKOP2MI — vacancy list',
  'source.siskop2mi_vacancies.purpose':
    'Matching P3MI, position, and destination country.',
  'source.siskop2mi_vacancies.limitation':
    'A vacancy that is not found is not proof that the vacancy is fake.',
  'source.jdih.name': 'JDIH KP2MI/BP2MI',
  'source.jdih.purpose': 'Placement-fee regulations and official decisions.',
  'source.jdih.limitation':
    'Applicability and current status must be reviewed by a qualified person.',
  'source.permen_17_2025.name':
    'Permen P2MI/BP2MI No. 17 of 2025 (Indonesian regulation)',
  'source.permen_17_2025.purpose': 'Initial reference for placement-fee governance.',
  'source.permen_17_2025.limitation':
    'Do not simplify this into “all fees are allowed” or “all fees are forbidden”. Requirements differ by destination country, placement scheme, and role.',
  'source.cekrekening.name': 'CekRekening',
  'source.cekrekening.purpose':
    'Manual check of bank or e-wallet accounts that have been reported.',
  'source.cekrekening.limitation':
    'The absence of a report does not mean an account is safe or official.',
  'source.aduannomor.name': 'AduanNomor',
  'source.aduannomor.purpose': 'Manual check of phone numbers that have been reported.',
  'source.aduannomor.limitation':
    'The absence of a report does not mean a number is official.',
  'source.peduli_wni.name': 'Peduli WNI — Ministry of Foreign Affairs of Indonesia',
  'source.peduli_wni.purpose':
    'Consular and procedural direction for Indonesian citizens abroad.',
  'source.peduli_wni.limitation':
    'Some services require registration or institutional access.',
  'source.kp2mi_complaint.name': 'KP2MI/BP2MI complaint channel',
  'source.kp2mi_complaint.purpose':
    'Complaints about suspected recruitment or placement violations.',
  'source.kp2mi_complaint.limitation':
    'No official digital complaint link has been reviewed and entered into the approved source registry yet.',

  'source.retrieved_at': 'Data retrieved: {date}',
  'source.checked_at': 'Checked: {date}',
  'source.snapshot_note': 'Based on test data updated on {date}.',
  'source.stale_note':
    'The reference data is past its freshness threshold. This result must not be treated as a current check.',
  'source.not_available': 'Cannot be checked yet',
  'source.open_external': 'Open {name}',
  'source.destination_domain': 'Destination: {domain}',

  // ---------------------------------------------------------------- claims
  'claim.not_provided': 'Not filled in',
  'claim.personal_account': 'Personal account',
  'claim.fee_breakdown_not_provided': 'No written fee breakdown provided',
  'claim.same_day_deadline': 'Asked to pay today',
  'claim.recipient_differs': 'Payment recipient differs from the agreement',
  'claim.purpose_differs': 'Purpose or amount differs from the agreement',
  'claim.contract.provided': 'Draft contract available',
  'claim.contract.not_provided': 'No draft contract yet',
  'claim.contract.unknown': 'Contract status not filled in',
  'claim.visa.provided': 'Visa document available',
  'claim.visa.not_provided': 'No visa document yet',
  'claim.visa.unknown': 'Visa status not filled in',

  // ---------------------------------------------------------------- missing info
  'missing.contact_handle': 'The number or account that contacted you.',
  'missing.official_contact_confirmation':
    'Confirmation from the official office that this contact really represents them.',
  'missing.account_type': 'The type of account receiving the payment.',
  'missing.official_payment_destination':
    'An official payment destination together with written proof.',
  'missing.written_fee_breakdown': 'A written fee breakdown from the company.',
  'missing.deadline_information': 'Information about the payment deadline.',
  'missing.deadline_justification': 'A written, official reason for that deadline.',
  'missing.written_agreement': 'A written agreement to compare against.',
  'missing.recipient_explanation': 'A written explanation of why the recipient differs.',
  'missing.agreement_comparison':
    'A comparison against the amount and purpose in the agreement.',
  'missing.company_name': 'The company or P3MI name.',
  'missing.official_company_record': 'A company record in an official source.',
  'missing.sanction_confirmation': 'Confirmation of the current sanction status.',
  'missing.licence_reconfirmation':
    'Re-confirmation of the licence number in the source.',
  'missing.official_contact_list': "The company's official contact list.",
  'missing.person_identity_confirmation':
    'Evidence that the person using this contact really works for that company.',
  'missing.vacancy_fields': 'Position, destination country, and company name.',
  'missing.official_vacancy_link': 'A link to the official vacancy.',
  'missing.vacancy_detail_confirmation':
    'Confirmation of the vacancy details through an official channel.',
  'missing.vacancy_country_explanation':
    'An explanation of why the destination country differs from the listed vacancy.',
  'missing.contract_draft': 'A written draft employment contract.',
  'missing.contract_authenticity':
    'Confirmation of the contract’s authenticity and completeness.',
  'missing.visa_type': 'The visa type and process that will be used.',
  'missing.visa_authenticity':
    'Confirmation of the visa document through an official channel.',

  // ---------------------------------------------------------------- company check
  'check.company.reason_missing_input':
    'The company name is empty, so there is nothing to compare yet.',
  'check.company.reason_source_unavailable':
    'This application holds no approved official dataset, so the company name cannot be checked automatically.',
  'check.company.reason_not_found':
    'This name was not found within the scope of the source checked.',
  'check.company.reason_match':
    'The company name matches one entry in the data checked after format normalization.',
  'check.company.reason_stale':
    'The matching entry comes from data past its freshness threshold, so it cannot count as a current check.',
  'check.company.finding_not_in_scope':
    'Not found within the scope of the source checked',
  'check.company.limitation':
    'This check compares a name only. It does not prove any contact, vacancy, contract, visa, or bank account.',
  'check.company.limitation_source_unavailable':
    'Because the source could not be checked, this result does not mean the company is unregistered.',
  'check.company.limitation_not_found':
    'Not found does not mean the company is illegal. The scope of the source checked is limited.',
  'check.company.limitation_match':
    'A registered company does not prove that the person contacting you represents it.',
  'check.company.next_action_missing':
    'Fill in the company name exactly as written in the offer.',
  'check.company.next_action_manual':
    'Open the official P3MI directory and search for the company name yourself.',
  'check.company.next_action_match':
    'Open the official source, then compare the office address and licence number with what the sender claimed.',

  // ---------------------------------------------------------------- contact check
  'check.contact.reason_missing_input':
    'The contact number or account is empty or could not be read.',
  'check.contact.reason_no_record':
    'No matching company record is available, so this contact cannot be compared with any official contact.',
  'check.contact.reason_not_listed':
    'This contact is not in the official contact list that was checked. That list does not necessarily contain every legitimate company contact.',
  'check.contact.reason_mismatch':
    'The source states its contact list is complete, and this contact differs from the official contacts listed.',
  'check.contact.reason_listed':
    'This contact is the same as one of the official contacts listed in the source checked.',
  'check.contact.finding_listed': 'Matches a contact listed in the source',
  'check.contact.finding_not_listed': 'Not listed in the source checked',
  'check.contact.finding_not_listed_complete':
    'Differs from the contacts listed in the source',
  'check.contact.limitation':
    'The company may well be found, but the identity of the person contacting you has not been shown to represent that company.',
  'check.contact.limitation_listed':
    'A number that matches an official contact does not prove who is using it right now.',
  'check.contact.next_action':
    'Contact the official office using a contact from an official source — not the number that contacted you — and ask whether this contact really represents them.',
  'check.contact.next_action_listed':
    'Still contact the official office to confirm who is using this contact.',

  // ---------------------------------------------------------------- vacancy check
  'check.vacancy.reason_missing_input':
    'The position, destination country, or company name is incomplete.',
  'check.vacancy.reason_source_unavailable':
    'The official vacancy source cannot be checked from inside this application.',
  'check.vacancy.reason_not_found':
    'No matching vacancy exists within the scope of the data checked.',
  'check.vacancy.reason_match':
    'The position and destination country match one vacancy in the data checked.',
  'check.vacancy.reason_mismatch':
    'The same position was found for this company, but its destination country differs from the offer.',
  'check.vacancy.finding_not_in_scope':
    'Not found within the scope of the source checked',
  'check.vacancy.limitation':
    'A vacancy that is not found is not proof that it is fake, and a vacancy that is found is not proof that the offer you received came from it.',
  'check.vacancy.next_action': 'Ask the company for a link to the official vacancy.',
  'check.vacancy.next_action_match':
    'Compare the official vacancy details with the offer you received.',

  // ---------------------------------------------------------------- contract & visa
  'check.contract.reason_provided':
    'You have received a draft contract, but MigranShield has not checked its content or authenticity.',
  'check.contract.reason_not_provided':
    'No written draft employment contract was provided.',
  'check.contract.reason_unknown': 'The contract status has not been filled in.',
  'check.contract.limitation':
    'The document exists, but MigranShield cannot verify that it is genuine. Confirm through an official channel.',
  'check.contract.next_action':
    'Ask for a written draft employment contract before taking any action.',
  'check.contract.next_action_provided':
    'Check the contract for completeness: employer identity, job, wage, duration, and fee components.',
  'check.visa.reason_provided':
    'A visa document is said to exist, but its authenticity cannot be checked from an image or a description.',
  'check.visa.reason_not_provided': 'No visa document or visa type is available yet.',
  'check.visa.reason_unknown': 'The visa status has not been filled in.',
  'check.visa.limitation':
    'The document exists, but MigranShield cannot verify that it is genuine. Confirm through an official channel.',
  'check.visa.next_action':
    'Ask for the visa type and process, then confirm with the official channel of the destination country.',

  // ---------------------------------------------------------------- payment rules
  'rule.payment_contact_unverified.reason':
    'The person or number requesting payment has not been shown to represent the company.',
  'rule.payment_contact_unverified.reason_missing':
    'The contact handle is empty, so this rule cannot be evaluated yet.',
  'rule.payment_contact_unverified.finding': 'The sender’s contact is not yet verified',
  'rule.payment_contact_unverified.limitation':
    'An unverified contact is not evidence of fraud; it is information that still has to be confirmed.',
  'rule.payment_contact_unverified.next_action':
    'Confirm the sender’s identity through an official contact you obtained yourself from an official source.',
  'rule.payment_personal_account.reason':
    'Payment is requested to a personal account that cannot be matched to an official payment destination.',
  'rule.payment_personal_account.reason_missing':
    'The recipient account type is empty, so this rule cannot be evaluated yet.',
  'rule.payment_personal_account.finding': 'Payment to an unverified personal account',
  'rule.payment_personal_account.limitation':
    'Paying a personal account does not always mean fraud, but money sent to a personal account is hard to recover.',
  'rule.payment_personal_account.next_action':
    'Ask for an official payment destination in the company’s name together with written proof.',
  'rule.payment_no_fee_breakdown.reason':
    'There is no written fee breakdown explaining the components and the basis for the charge.',
  'rule.payment_no_fee_breakdown.reason_missing':
    'Whether a written fee breakdown exists has not been filled in, so this rule cannot be evaluated yet.',
  'rule.payment_no_fee_breakdown.finding': 'No written fee breakdown provided',
  'rule.payment_no_fee_breakdown.limitation':
    'Which placement fees may be charged differs by destination country, scheme, and role. MigranShield does not claim that migrant workers can never be charged anything.',
  'rule.payment_no_fee_breakdown.next_action':
    'Ask for a written fee breakdown and the rule it is based on before paying.',
  'rule.time_pressure.reason':
    'You are asked to move money on the same day, leaving no time to verify.',
  'rule.time_pressure.reason_missing':
    'The payment deadline has not been filled in, so this rule cannot be evaluated yet.',
  'rule.time_pressure.finding': 'Asked to transfer on the same day',
  'rule.time_pressure.limitation':
    'An urgent deadline does not always mean fraud, but an official deadline can normally be explained in writing.',
  'rule.time_pressure.next_action':
    'Ask for that deadline in writing, and do not pay before verification is complete.',
  'rule.payment_recipient_differs.reason':
    'The payment recipient differs from the party named in the agreement you reviewed.',
  'rule.payment_recipient_differs.reason_missing':
    'There is no written agreement to compare the payment recipient against.',
  'rule.payment_recipient_differs.finding':
    'Payment recipient differs from the agreement',
  'rule.payment_recipient_differs.limitation':
    'A different recipient can have a legitimate explanation, but that explanation must be written and verifiable.',
  'rule.payment_recipient_differs.next_action':
    'Ask for a written explanation and confirm with the official office before sending money.',
  'rule.payment_purpose_differs.reason':
    'The payment purpose or amount differs from what the agreement states.',
  'rule.payment_purpose_differs.reason_missing':
    'There is no written agreement to compare the payment purpose against.',
  'rule.payment_purpose_differs.finding': 'Purpose or amount differs from the agreement',
  'rule.payment_purpose_differs.limitation':
    'Costs can change, but an official change can always be shown in writing.',
  'rule.payment_purpose_differs.next_action':
    'Ask for the updated agreement in writing before paying.',

  // ---------------------------------------------------------------- home
  'home.hero.eyebrow': 'CHECK BEFORE YOU PAY',
  'home.hero.title': 'Received an overseas job offer?',
  'home.hero.body':
    'Upload the chat or the offer poster. MigranShield helps break down its claims and shows what you still need to verify.',
  'home.hero.cta': 'Check an offer',
  'home.scope_notice':
    'MigranShield maps evidence and missing information. It does not guarantee that an offer is safe, and it does not declare that an offer is fraud.',
  'home.privacy_reminder':
    'Before uploading: do not upload an ID card, passport, identity number, or any document containing sensitive personal data.',
  'home.learning.title': 'Digital literacy practice',
  'home.learning.body':
    'Learn to recognise manipulation patterns and verify things yourself.',
  'home.progress.title': 'Verification readiness',
  'home.progress.value': '{done}/{total}',
  'home.progress.body': 'You have practised {done} of {total} core verification steps.',
  'home.scenario.section': 'Composite scenario',
  'home.scenario.note': 'Built from reported case patterns — not a real individual.',
  'home.scenario.title': '“Siti” — caregiver in Taiwan',
  'home.scenario.quote': '“They knew my name and address, so I assumed it was official…”',

  // ---------------------------------------------------------------- upload
  'upload.title': 'Upload an offer',
  'upload.privacy_warning_title': 'Protect your personal data.',
  'upload.privacy_warning':
    'Do not upload an ID card, passport, identity number, or any document containing sensitive personal data.',
  'upload.dropzone_title': 'Upload a chat, poster, or offer',
  'upload.formats': 'JPG, PNG, or WebP (10 MB maximum)',
  'upload.method_camera': 'Camera',
  'upload.method_file': 'File',
  'upload.method_manual': 'Type manually',
  'upload.ai_note':
    'Text reading runs on your device and only helps fill in the form. You still review and correct it in the next step.',
  'upload.local_note':
    'The image is not sent to a MigranShield server. Text reading runs in your browser.',
  'upload.demo_button': 'Use the example offer (demo)',
  'upload.demo_note':
    'The example offer uses entirely fictional test data and is labelled “Prototype example result”.',
  'upload.selected_file': 'File selected: {name}',
  'upload.start_ocr': 'Read text from the image',
  'upload.ocr_progress': 'Reading text… {percent}%',
  'upload.ocr_cancel': 'Cancel reading',
  'upload.ocr_failed_title': 'The text could not be read',
  'upload.ocr_failed_body':
    'Text reading could not finish on this device. Nothing you entered is lost — continue by filling in the form manually.',
  'upload.ocr_manual_fallback': 'Fill in manually instead',
  'upload.error.too_large': 'The file is larger than 10 MB. Choose a smaller image.',
  'upload.error.unsupported': 'This file format is not supported. Use JPG, PNG, or WebP.',
  'upload.error.signature':
    'The file contents do not match its format. Choose another image.',
  'upload.error.decode': 'The image could not be opened. Choose another image.',
  'upload.error.dimensions':
    'The image is too large to process on this device. Choose another image.',
  'upload.error_title': 'This file cannot be used yet',

  // ---------------------------------------------------------------- confirmation
  'confirm.title': 'Confirm the information',
  'confirm.notice':
    'Please re-check the information below. The system can misread text in an image.',
  'confirm.needs_check': 'needs checking',
  'confirm.empty': 'Not filled in',
  'confirm.extraction_source': 'Filled in from: {source}',
  'confirm.extraction_source_ocr': 'text read on your device',
  'confirm.extraction_source_manual': 'your manual entry',
  'confirm.extraction_source_demo': 'the example offer (test data)',
  'confirm.submit': 'Continue to the check',
  'confirm.back_to_upload': 'Back to the upload step',
  'confirm.section_offer': 'Offer',
  'confirm.section_contact': 'Contact channel',
  'confirm.section_payment': 'Payment',
  'confirm.section_documents': 'Documents and deadline',
  'confirm.validation_summary': 'Check the following {count} fields before continuing.',

  'field.companyName': 'Company / P3MI',
  'field.recruiterName': 'Recruiter name',
  'field.position': 'Job position',
  'field.destinationCountry': 'Destination country',
  'field.offerOrigin': 'Where the offer came from',
  'field.contactChannel': 'Contact channel type',
  'field.contactHandle': 'Contact number / account',
  'field.paymentAmount': 'Amount requested',
  'field.paymentPurpose': 'Stated payment purpose',
  'field.paymentRecipient': 'Recipient name',
  'field.accountType': 'Account type',
  'field.writtenFeeBreakdown': 'Written fee breakdown',
  'field.receipt': 'Receipt or payment proof',
  'field.recipientVsAgreement': 'Recipient compared with the written agreement',
  'field.purposeVsAgreement': 'Purpose/amount compared with the written agreement',
  'field.officialChannelConfirmation': 'Confirmed through an official channel',
  'field.contractStatus': 'Contract status',
  'field.visaStatus': 'Visa status',
  'field.visaType': 'Visa type',
  'field.timePressure': 'Payment deadline',
  'field.paymentDeadlineNote': 'Deadline note',

  'option.account.personal': 'Personal account',
  'option.account.company': 'Company account',
  'option.account.unknown': 'Not known yet',
  'option.document.provided': 'Available',
  'option.document.not_provided': 'Not available',
  'option.document.unknown': 'Not known yet',
  'option.agreement.same': 'Same as the agreement',
  'option.agreement.different': 'Differs from the agreement',
  'option.agreement.unknown': 'No written agreement yet',
  'option.confirmation.done': 'Confirmed',
  'option.confirmation.not_done': 'Not confirmed',
  'option.confirmation.unknown': 'Not known yet',
  'option.time.same_day': 'Today',
  'option.time.within_days': 'Within a few days',
  'option.time.no_deadline': 'No deadline',
  'option.time.unknown': 'Not known yet',
  'option.channel.whatsapp': 'WhatsApp',
  'option.channel.phone': 'Phone call',
  'option.channel.sms': 'SMS',
  'option.channel.email': 'Email',
  'option.channel.social': 'Social media',
  'option.channel.unknown': 'Not known yet',

  // ---------------------------------------------------------------- result
  'result.title': 'Check result',
  'result.recommendation.delay_payment.headline': 'Hold off on paying',
  'result.recommendation.delay_payment.body':
    'Delay payment until the identity of the sender, the fee breakdown, and the payment destination can be verified through official channels.',
  'result.recommendation.verify_before_acting.headline': 'Verify before you act',
  'result.recommendation.verify_before_acting.body':
    'Parts of this offer cannot be verified yet. Gather the evidence through official channels before paying, sending documents, signing, or departing.',
  'result.recommendation.no_indicator_triggered.headline':
    'No risk indicator was triggered',
  'result.recommendation.no_indicator_triggered.body':
    'From the information you confirmed, no rule was triggered. That is not a guarantee that the offer is safe. Still verify through official channels before paying or departing.',
  'result.indicator_count': '{count} risk indicators found',
  'result.indicator_count_zero': 'No risk indicator was triggered',
  'result.indicator_list_label': 'List of triggered risk indicators',
  'result.section_verification': 'Verification',
  'result.section_evidence': 'Evidence map',
  'result.section_actions': 'Safe actions',
  'result.company_card': 'Company / P3MI',
  'result.contact_card': 'Contacting channel',
  'result.company_found_badge': 'Found in the source checked',
  'result.contact_separation_notice':
    'The company was found, but the identity of the person contacting you has not been shown to represent that company.',
  'result.next_step_label': 'Next step',
  'result.payment_check': 'Payment safety check',
  'result.payment_check_summary': '{amount} · {account}',
  'result.payment_item.amount': 'Amount',
  'result.payment_item.purpose': 'Stated purpose',
  'result.payment_item.recipient': 'Recipient name',
  'result.payment_item.account_type': 'Account type',
  'result.payment_item.fee_breakdown': 'Written fee breakdown',
  'result.payment_item.receipt': 'Receipt / proof',
  'result.payment_item.time_pressure': 'Time pressure',
  'result.payment_item.official_confirmation': 'Official-channel confirmation',
  'result.payment_badge_risk': 'risk indicator',
  'result.payment_badge_unknown': 'not available',
  'result.payment_badge_info': 'information',
  'result.evidence_claim': 'Claim',
  'result.evidence_finding': 'Finding',
  'result.evidence_status': 'Status',
  'result.evidence_reason': 'Reason',
  'result.evidence_source': 'Source',
  'result.evidence_method': 'Comparison method',
  'result.evidence_missing': 'Still missing',
  'result.evidence_limitation': 'Limit of this check',
  'result.evidence_next': 'Next',
  'result.evidence_rule': 'Rule {ruleId} version {ruleVersion}',
  'result.evidence_snapshot': 'Data version: {snapshotId}',
  'result.action_message': 'Create a verification message',
  'result.action_sources': 'View official sources',
  'result.action_share': 'Share a summary',
  'result.action_contact': 'Contact through an official channel',
  'result.action_complaint': 'Report a suspicious offer or contact',
  'result.exercise_eyebrow': 'PERSONAL PRACTICE',
  'result.exercise_title': 'Practise the part you still need to verify.',
  'result.exercise_reason':
    'This exercise is recommended based on the part you still need to verify.',
  'result.exercise_cta': 'Start the personal exercise',
  'result.limitation':
    'MigranShield helps break down claims, compare evidence, and show what still needs verifying. This result is not a legal decision and not a guarantee that an offer is safe or fraudulent.',
  'result.no_state_title': 'The check data is no longer available',
  'result.no_state_body':
    'Offer information is kept in memory for the active session only and is lost when the page reloads. None of your data was stored. Start again from the upload or manual-entry step.',
  'result.no_state_cta': 'Start a new check',

  // ---------------------------------------------------------------- official channels
  'channels.title': 'Official channels',
  'channels.intro':
    'The buttons below take you to official services so you can verify things yourself. MigranShield does not file reports automatically and does not send your offer content.',
  'channels.section_verify': 'For checking things yourself',
  'channels.section_complaint': 'Official complaint channels',
  'channels.official_contact_title': 'Official company contact',
  'channels.official_contact_body':
    'Call the office number listed in the official source, not the number that contacted you.',
  'channels.official_contact_unavailable':
    'No official contact from an approved source is available to display. Look up the office contact yourself in the official directory.',
  'channels.recommended': 'Recommended for your case',
  'channels.report_object': 'What can be reported',
  'channels.why': 'Why this channel may be relevant',
  'channels.evidence_hint': 'Evidence you may need to prepare',
  'channels.limitation': 'Limits of this service',
  'channels.handoff_notice':
    'You are about to open an official service outside MigranShield. MigranShield does not send a report or any offer data automatically. Review the information you want to give that service.',
  'channels.unavailable_title': 'No digital complaint channel is available yet',
  'channels.unavailable_body':
    'No official digital complaint link has been reviewed and entered into the approved source registry. MigranShield will not show an unverified link.',
  'channels.alternative': 'Available official alternative',
  'channels.no_data_transmitted':
    'MigranShield sends no offer content, number, account, or check result to that service.',

  // ---------------------------------------------------------------- complaints
  'complaint.aduannomor.object': 'The phone number or account that contacted you.',
  'complaint.aduannomor.why':
    'This service is used to check and report phone numbers suspected of being used for fraud.',
  'complaint.aduannomor.evidence':
    'The full number, screenshots of the conversation, and when it happened. Prepare these yourself; MigranShield does not attach them.',
  'complaint.aduannomor.limitation':
    'The absence of a report on this service does not prove that the number is official.',
  'complaint.aduannomor.recommended_because':
    'Recommended because the identity of the contacting channel is not yet verified.',
  'complaint.cekrekening.object': 'The bank or e-wallet account receiving the payment.',
  'complaint.cekrekening.why':
    'This service is used to check and report accounts suspected of being used for crime.',
  'complaint.cekrekening.evidence':
    'The account number, holder name, and any transaction proof. Prepare these yourself; MigranShield does not attach them.',
  'complaint.cekrekening.limitation':
    'The absence of a report on this service does not prove that the account is safe or official.',
  'complaint.cekrekening.recommended_because':
    'Recommended because payment is requested to an account that cannot be verified yet.',
  'complaint.kp2mi.object':
    'A suspected recruitment or placement violation by a P3MI or an intermediary.',
  'complaint.kp2mi.why':
    'Recruitment and placement of Indonesian migrant workers is supervised by KP2MI/BP2MI.',
  'complaint.kp2mi.evidence':
    'The company or intermediary identity, the offer content, and a timeline. Prepare these yourself; MigranShield does not attach them.',
  'complaint.kp2mi.limitation':
    'Filing a report does not mean it is immediately accepted, investigated, or resolved.',
  'complaint.kp2mi.recommended_because':
    'Recommended because this offer involves a placement company and an overseas vacancy.',
  'complaint.peduli_wni.object':
    'A need for consular or procedural help for an Indonesian citizen abroad.',
  'complaint.peduli_wni.why':
    'Indonesian missions abroad handle consular assistance for Indonesian citizens.',
  'complaint.peduli_wni.evidence':
    'Your identity, location, and a description of the situation. Prepare these yourself; MigranShield does not attach them.',
  'complaint.peduli_wni.limitation':
    'Some functions require registration or extra information on that official service.',

  // ---------------------------------------------------------------- message
  'message.title': 'Verification message',
  'message.intro':
    'Send this message to the official company contact to request evidence before you take any action.',
  'message.preview_label': 'Message preview',
  'message.body':
    'Please send the official vacancy link, the P3MI name and licence number, the draft contract, a written fee breakdown, and the official office contact I can use to verify.',
  'message.copy': 'Copy the message',
  'message.copied': 'Message copied.',
  'message.copy_failed':
    'The message could not be copied. Copy it manually from the preview above.',
  'message.view_channels': 'View official contacts',

  // ---------------------------------------------------------------- share
  'share.title': 'Share a summary',
  'share.privacy_note':
    'This summary contains no original image, no read-out text, no full phone number, no account number, no identity number, and not your full name.',
  'share.preview_label': 'Summary preview',
  'share.recommendation': 'Recommendation: {recommendation}',
  'share.position': 'Position: {position}',
  'share.country': 'Destination country: {country}',
  'share.contact': 'Contacting channel: {contact} (masked)',
  'share.indicators': '{count} risk indicators found',
  'share.category_line': '{category}: {status}',
  'share.checked_at': 'Checked: {date}',
  'share.footer': 'MigranShield · not a legal decision',
  'share.copy': 'Copy the summary',
  'share.copied': 'Summary copied.',
  'share.share_menu': 'Share with family or a companion',
  'share.share_warning':
    'Your device or browser share menu is outside MigranShield’s control.',

  // ---------------------------------------------------------------- learning
  'learn.title': 'Literacy practice',
  'learn.intro':
    'This exercise is recommended based on the part you still need to verify.',
  'learn.intro_no_result':
    'There is no check result in this session yet. You can still try any of the exercises below.',
  'learn.recommended_for_you': 'Recommended for you',
  'learn.all_exercises': 'All exercises',
  'learn.pattern_cta': 'Study the manipulation patterns',
  'learn.progress_label': 'Recognised in {done} of {total} exercises.',
  'exercise.identity_misuse.title': 'Misuse of an institution’s identity',
  'exercise.identity_misuse.reason':
    'Because the contacting channel cannot be verified yet.',
  'exercise.urgency.title': 'Urgency and time pressure',
  'exercise.urgency.reason': 'Because you are pressured to pay today.',
  'exercise.written_evidence.title': 'Asking for written evidence',
  'exercise.written_evidence.reason': 'Because no contract is available yet.',
  'exercise.payment_destination.title': 'Checking the payment destination',
  'exercise.payment_destination.reason':
    'Because payment is requested to a personal account.',

  // ---------------------------------------------------------------- simulation
  'sim.title': 'Recruiter simulation',
  'sim.badge': 'Practice',
  'sim.scenario': 'Scenario: a caregiver offer for Taiwan (composite)',
  'sim.message':
    '“Congratulations! You passed the caregiver selection for Taiwan. Only 2 slots left — transfer the Rp7,500,000 administration fee today so your slot is not lost.”',
  'sim.tactic_authority': 'Authority tactic',
  'sim.tactic_urgency': 'Urgency tactic',
  'sim.question': 'What is the safest response?',
  'sim.option_transfer': 'All right, I will transfer right now.',
  'sim.option_verify':
    'I need to verify first. Please send the official P3MI name and licence number, the employment contract, and a written fee breakdown.',
  'sim.option_negotiate': 'Can the fee be lower?',
  'sim.safe_title': 'Right. You paused and asked for official evidence.',
  'sim.safe_body':
    'Pausing to verify breaks the urgency tactic. Ask for the P3MI name and licence number, the contract, and the fee breakdown through official channels before doing anything.',
  'sim.unsafe_title': 'Careful — this is what fraudsters aim for.',
  'sim.unsafe_body':
    'Transferring now and haggling over the price both skip verification. Money that has reached a personal account is almost impossible to recover.',
  'sim.retry': 'Try another response',
  'sim.see_patterns': 'See the pattern breakdown',

  // ---------------------------------------------------------------- patterns
  'pattern.title': 'Pattern breakdown',
  'pattern.intro':
    'Many studied cases combine the patterns below. Recognising the sequence helps you stop and verify.',
  'pattern.authority.title': 'Authority',
  'pattern.authority.quote': '“You passed the caregiver selection for Taiwan…”',
  'pattern.authority.body':
    'Claiming to be from an official institution or agency so you trust without checking.',
  'pattern.urgency.title': 'Urgency',
  'pattern.urgency.quote': '“Only 2 slots left — today only.”',
  'pattern.urgency.body':
    'Squeezing the time so you cannot think clearly or verify anything.',
  'pattern.skip.title': 'Skipping procedure',
  'pattern.skip.quote': '“No need for a contract yet, we will sort it out later.”',
  'pattern.skip.body':
    'Jumping over the employment contract and the official P3MI process — steps that should be mandatory.',
  'pattern.payment.title': 'Asking for money',
  'pattern.payment.quote': '“Transfer Rp7,500,000 to this account.”',
  'pattern.payment.body':
    'The ending is often the same: money to a personal account before any evidence is given.',
  'pattern.closing':
    'A payment request to a personal account that cannot be verified is a risk indicator.',
  'pattern.scenario_cta': 'See the composite scenario',

  // ---------------------------------------------------------------- scenario
  'scenario.title': 'Composite scenario',
  'scenario.notice':
    'A composite scenario based on reported case patterns. Not a real individual; names and details are altered.',
  'scenario.illustration': 'composite illustration',
  'scenario.name': '“Siti” (composite)',
  'scenario.subtitle': 'Caregiver case pattern, Taiwan',
  'scenario.quote':
    'They knew my full name and my address, so I thought this was official. It was only a way to make me trust without checking.',
  'scenario.lessons': 'What can be learned',
  'scenario.lesson_1':
    'Knowing your personal data is not a sign of officialdom — data leaks and is traded.',
  'scenario.lesson_2':
    '“Today only” is an urgency tactic — a reason to stop and check, not to hurry.',
  'scenario.lesson_3':
    'Payment to a personal account without a written breakdown means stop and verify through official channels.',
  'scenario.cta': 'Practise this scenario',

  // ---------------------------------------------------------------- progress
  'progress.title': 'Progress',
  'progress.readiness_title': 'Verification readiness',
  'progress.readiness_body':
    'Counted from {total} core verification steps: company, contact, contract, fees, and time pressure. You have practised {done} of {total}.',
  'progress.per_tactic': 'Progress per exercise',
  'progress.history': 'Check history',
  'progress.history_note':
    'History only holds checks from this session plus prototype examples. MigranShield does not store your offer history.',
  'progress.history_empty':
    'No check has been run in this session yet. The entries below are prototype data.',
  'progress.history_demo_1': 'Caregiver offer, Taiwan',
  'progress.history_demo_2': 'Factory vacancy, Malaysia',
  'progress.history_needs_confirmation': 'Needs confirmation',
  'progress.session_entry': 'Check from this session',
  'progress.indicator_badge': '{count} risk indicators',

  // ---------------------------------------------------------------- errors
  'error.title': 'Something went wrong',
  'error.body':
    'This step could not be completed. The information you already entered in this session remains valid unless stated otherwise.',
  'error.retry': 'Try again',
  'error.not_found_title': 'Page not found',
  'error.not_found_body': 'The page you were looking for is not available.',
  'error.go_home': 'Back to home',
  'offline.title': 'You are offline',
  'offline.body':
    'Part of the application is available offline. Checks that need an official source can run again once you are back online.',
};

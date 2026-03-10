import { ReportRecord } from '../../types/reports';

export const mockReportRecords: ReportRecord[] = [
  {
    id: 1,
    booking_id: 'BK-2026-001',
    status: 'completed',
    error: null,
    model: 'gpt-4o',
    prompt_version: 'v2.3',
    input_chars: 15420,
    output_chars: 8934,
    created_at: '2026-02-24T14:30:00Z',
    summary_text: 'This monthly coaching review focused on onboarding activities...',
    report_html: '<html><body><h1>Monthly Coaching Review Report</h1>...</body></html>',
    summary_json: {
      date: '2026-02-24',
      coach: 'Med Maher',
      learner: 'Jonwilliam Macintyre',
      duration: '00:40:11',
      duration_inferred_minutes: 22,
      duration_score_1_to_5: 1,
      employer: 'Not evidenced in transcript',
      programme: 'Level 6 Project Controls Professional Oct.25',
      Group: 'PCP Level 6 - October 2025',
      executive_summary: 'This monthly coaching review focused on onboarding activities: a walkthrough of the Aptem dashboard and LMS components (attendance, LMS activity, assignments, job activity), completion of the Personal Support Plan (PSP), induction checklist confirmation (policies, safeguarding, functional skills), and career aspirations (short- and long-term SMART goals). The coach clarified how to record hours and upload evidence (suggested bundling screenshots), explained off-the-job hours and progress/review scheduling, and reviewed key future dates including the gateway/progress review timeline.',
      strengths: [
        'Coach provided a clear, step-by-step walkthrough of the Aptem dashboard, LMS components and how evidence/hours are recorded.',
        'Personal Support Plan and induction checklist were completed and recorded in-session.',
        'Learner was engaged, transparent about current gaps (understanding KSBs, LMS learning curve) and committed to actions to progress.',
        'Concrete scheduling and planning: discussion of gateway/progress review dates and flexibility to schedule reviews with employer input.',
        'Practical tips given (bundle screenshots into one file, submit assignments 48 hours before review) to reduce administrative errors.'
      ],
      priority_actions: [
        {
          owner: 'Jonwilliam Macintyre',
          action: 'Upload session three hours and any remaining LMS evidence (bundle screenshots into single file where possible).',
          due: 'ASAP / by end of day or next day as discussed'
        },
        {
          owner: 'Jonwilliam Macintyre',
          action: 'Complete and extend the assignment to specify the case/business (C/BS) details and link relevant KSBs; submit assignment at least 48 hours before the scheduled monthly coaching review.',
          due: 'Submit before scheduled monthly coaching review (aim: start of March)'
        },
        {
          owner: 'Med Maher',
          action: 'Provide PDF/file outlining the End Point Assessment format and examples to help learner prepare over the year.',
          due: 'Next coaching contact / within 1 week'
        }
      ],
      overall_rating: {
        rag: 'Amber',
        qualitative: 'Good onboarding content, coach explanations were clear and supportive; however the session was shorter than expected and KSB evidence linking remains incomplete.',
        average_rating: 3.5,
        professional_judgement: 'The session effectively covered administrative onboarding, PSP completion and set clear next steps. However, the duration was significantly below the expected monthly review length, limiting deeper KSB verification and detailed review of submitted evidence.'
      },
      qa: [
        {
          metric: 'Duration',
          result: 'Session was substantially shorter than the target monthly review duration.',
          rating_1_to_5: 1,
          rag: 'Red',
          notes: 'Inferred meeting length from transcript timestamps ~22 minutes (target 60 minutes). Short duration limits depth of review, reduces opportunity for KSB evidence verification during the meeting.',
          evidence: [
            {
              timecode: '00:00:08',
              speaker: 'Jonwilliam Macintyre',
              quote: 'But it okey dokey.',
              why_it_matters: 'Shows meeting started at this time; used to infer actual meeting window.'
            },
            {
              timecode: '00:22:34',
              speaker: 'Jonwilliam Macintyre',
              quote: 'Yeah, no problem. Have a fantastic. Have a fantastic day, Matt.',
              why_it_matters: 'Shows meeting close around this time indicating shorter than scheduled duration.'
            }
          ]
        },
        {
          metric: 'Welcome Student',
          result: 'Coach checked connectivity, confirmed screen share and established rapport promptly.',
          rating_1_to_5: 4,
          rag: 'Green',
          notes: 'Warm, efficient start; screen-sharing verification and quick engagement observed.',
          evidence: [
            {
              timecode: '00:00:11',
              speaker: 'Med Maher',
              quote: 'So can you see my screen?',
              why_it_matters: 'Verifies coach ensured learner could follow content visually, important for clarity of walkthrough.'
            }
          ]
        },
        {
          metric: 'Presentation',
          result: 'Coach delivered structured walkthrough of Aptem dashboard and LMS components.',
          rating_1_to_5: 4,
          rag: 'Green',
          notes: 'Clear navigation through system features, practical tips provided.',
          evidence: []
        },
        {
          metric: 'KSB Evidence',
          result: 'Limited KSB evidence verification during session.',
          rating_1_to_5: 2,
          rag: 'Amber',
          notes: 'Learner identified KSBs as area needing further understanding. Short session duration limited detailed evidence review.',
          evidence: []
        }
      ]
    }
  },
  {
    id: 2,
    booking_id: 'BK-2026-002',
    status: 'completed',
    error: null,
    model: 'gpt-4o',
    prompt_version: 'v2.3',
    input_chars: 18200,
    output_chars: 9845,
    created_at: '2026-02-23T10:15:00Z',
    summary_text: 'Comprehensive progress review covering KSB mapping and portfolio development...',
    report_html: '<html><body><h1>Progress Review Report</h1>...</body></html>',
    summary_json: {
      date: '2026-02-23',
      coach: 'Sarah Johnson',
      learner: 'Emma Thompson',
      duration: '01:05:30',
      duration_inferred_minutes: 65,
      duration_score_1_to_5: 5,
      employer: 'Tech Solutions Ltd',
      programme: 'Level 5 Software Developer',
      Group: 'SD Level 5 - January 2026',
      executive_summary: 'Comprehensive progress review covering KSB mapping and portfolio development. Learner demonstrated strong understanding of core programming concepts and successfully linked recent project work to multiple KSBs. Discussion included career progression planning and preparation for upcoming gateway assessment.',
      strengths: [
        'Excellent KSB mapping demonstrated with clear links between work activities and learning outcomes.',
        'Strong portfolio of evidence including code samples, project documentation, and peer feedback.',
        'Proactive approach to learning with additional self-study materials completed.',
        'Clear articulation of technical concepts and ability to reflect on learning journey.',
        'Well-prepared for session with questions and topics ready for discussion.'
      ],
      priority_actions: [
        {
          owner: 'Emma Thompson',
          action: 'Complete remaining unit tests for current project and upload to portfolio with commentary on testing approach.',
          due: '2026-03-05'
        },
        {
          owner: 'Emma Thompson',
          action: 'Schedule mock EPA session with assessor to practice presentation and Q&A format.',
          due: '2026-03-15'
        },
        {
          owner: 'Sarah Johnson',
          action: 'Share EPA preparation guide and sample questions for technical interview component.',
          due: '2026-02-28'
        }
      ],
      overall_rating: {
        rag: 'Green',
        qualitative: 'Excellent progress demonstrated across all areas. Learner is on track for successful completion and shows strong engagement with the programme.',
        average_rating: 4.7,
        professional_judgement: 'Outstanding session with comprehensive coverage of all required elements. Learner demonstrates readiness for gateway and shows excellent understanding of programme requirements. Continue current trajectory with focus on EPA preparation.'
      },
      qa: [
        {
          metric: 'Duration',
          result: 'Session met expected duration for progress review.',
          rating_1_to_5: 5,
          rag: 'Green',
          notes: 'Full 65-minute session allowed comprehensive review of all portfolio elements and detailed discussion of progress.',
          evidence: []
        },
        {
          metric: 'Welcome Student',
          result: 'Professional and warm welcome with clear agenda setting.',
          rating_1_to_5: 5,
          rag: 'Green',
          notes: 'Coach established positive rapport and outlined session structure clearly.',
          evidence: []
        },
        {
          metric: 'Presentation',
          result: 'Highly structured and comprehensive review of all programme elements.',
          rating_1_to_5: 5,
          rag: 'Green',
          notes: 'Systematic walkthrough of KSBs, portfolio evidence, and EPA preparation.',
          evidence: []
        },
        {
          metric: 'KSB Evidence',
          result: 'Comprehensive KSB evidence reviewed and verified.',
          rating_1_to_5: 5,
          rag: 'Green',
          notes: 'All required KSBs covered with strong evidence links. Portfolio demonstrates clear progression.',
          evidence: []
        }
      ]
    }
  },
  {
    id: 3,
    booking_id: 'BK-2026-003',
    status: 'failed',
    error: 'API timeout: OpenAI request exceeded 120s limit',
    model: 'gpt-4o',
    prompt_version: 'v2.2',
    input_chars: 22500,
    output_chars: 0,
    created_at: '2026-02-22T16:45:00Z',
    summary_text: null,
    report_html: null,
    summary_json: null
  },
  {
    id: 4,
    booking_id: 'BK-2026-004',
    status: 'pending',
    error: null,
    model: 'gpt-4o-mini',
    prompt_version: 'v2.3',
    input_chars: 0,
    output_chars: 0,
    created_at: '2026-02-24T15:00:00Z',
    summary_text: null,
    report_html: null,
    summary_json: null
  },
  {
    id: 5,
    booking_id: 'BK-2026-005',
    status: 'processing',
    error: null,
    model: 'gpt-4o',
    prompt_version: 'v2.3',
    input_chars: 16800,
    output_chars: 0,
    created_at: '2026-02-24T14:55:00Z',
    summary_text: null,
    report_html: null,
    summary_json: null
  },
  {
    id: 6,
    booking_id: 'BK-2026-006',
    status: 'completed',
    error: null,
    model: 'gpt-4o-mini',
    prompt_version: 'v2.3',
    input_chars: 12300,
    output_chars: 6420,
    created_at: '2026-02-21T11:20:00Z',
    summary_text: 'Initial onboarding session with focus on programme structure...',
    report_html: '<html><body><h1>Onboarding Review</h1>...</body></html>',
    summary_json: {
      date: '2026-02-21',
      coach: 'David Chen',
      learner: 'Michael Roberts',
      duration: '00:45:20',
      duration_inferred_minutes: 45,
      duration_score_1_to_5: 4,
      employer: 'Global Manufacturing Inc',
      programme: 'Level 4 Business Administrator',
      Group: 'BA Level 4 - February 2026',
      executive_summary: 'Initial onboarding session covering programme structure, expectations, and learning resources. Learner showed enthusiasm and understanding of apprenticeship requirements. Discussed workplace integration and initial evidence gathering strategies.',
      strengths: [
        'Clear understanding of apprenticeship structure and requirements.',
        'Positive attitude and eagerness to engage with learning materials.',
        'Good initial questions about evidence collection and portfolio building.',
        'Employer support confirmed and workplace mentor identified.'
      ],
      priority_actions: [
        {
          owner: 'Michael Roberts',
          action: 'Complete initial skills scan and upload to learning platform.',
          due: '2026-02-28'
        },
        {
          owner: 'Michael Roberts',
          action: 'Arrange meeting with workplace mentor to discuss evidence gathering opportunities.',
          due: '2026-03-01'
        },
        {
          owner: 'David Chen',
          action: 'Send welcome pack with programme handbook and KSB overview document.',
          due: '2026-02-23'
        }
      ],
      overall_rating: {
        rag: 'Green',
        qualitative: 'Strong start to the programme with clear understanding and positive engagement.',
        average_rating: 4.2,
        professional_judgement: 'Excellent onboarding session. Learner demonstrates readiness to engage with programme and has good support structures in place.'
      },
      qa: [
        {
          metric: 'Duration',
          result: 'Appropriate duration for onboarding session.',
          rating_1_to_5: 4,
          rag: 'Green',
          notes: '45-minute session covered all essential onboarding elements.',
          evidence: []
        },
        {
          metric: 'Welcome Student',
          result: 'Warm welcome with clear introduction to programme.',
          rating_1_to_5: 5,
          rag: 'Green',
          notes: 'Coach created welcoming environment and set clear expectations.',
          evidence: []
        },
        {
          metric: 'Presentation',
          result: 'Well-structured overview of programme components.',
          rating_1_to_5: 4,
          rag: 'Green',
          notes: 'Clear explanation of learning platform, evidence requirements, and support available.',
          evidence: []
        },
        {
          metric: 'KSB Evidence',
          result: 'Initial discussion of KSB framework and evidence expectations.',
          rating_1_to_5: 4,
          rag: 'Green',
          notes: 'Appropriate for onboarding stage. Learner understands evidence gathering approach.',
          evidence: []
        }
      ]
    }
  },
  {
    id: 7,
    booking_id: 'BK-2026-007',
    status: 'completed',
    error: null,
    model: 'gpt-4o',
    prompt_version: 'v2.3',
    input_chars: 19500,
    output_chars: 10200,
    created_at: '2026-02-20T09:30:00Z',
    summary_text: 'Challenging session addressing learner concerns about workplace support...',
    report_html: '<html><body><h1>Support Review</h1>...</body></html>',
    summary_json: {
      date: '2026-02-20',
      coach: 'Lisa Martinez',
      learner: 'James Wilson',
      duration: '00:55:15',
      duration_inferred_minutes: 55,
      duration_score_1_to_5: 5,
      employer: 'Retail Solutions Group',
      programme: 'Level 3 Customer Service Specialist',
      Group: 'CSS Level 3 - December 2025',
      executive_summary: 'Challenging session addressing learner concerns about workplace support and time allocation for off-the-job training. Coach worked with learner to develop action plan for discussing concerns with employer and identifying alternative evidence gathering opportunities. Safeguarding concerns noted regarding workplace pressure.',
      strengths: [
        'Learner was open and honest about challenges faced in workplace.',
        'Coach demonstrated excellent listening skills and empathy.',
        'Collaborative problem-solving approach to identify solutions.',
        'Clear action plan developed with specific steps and timelines.'
      ],
      priority_actions: [
        {
          owner: 'Lisa Martinez',
          action: 'Contact employer to discuss off-the-job training allocation and learner support requirements.',
          due: '2026-02-22'
        },
        {
          owner: 'James Wilson',
          action: 'Document specific instances where training time was not provided as agreed.',
          due: '2026-02-25'
        },
        {
          owner: 'Lisa Martinez',
          action: 'Escalate safeguarding concern regarding workplace pressure to programme manager.',
          due: '2026-02-21'
        },
        {
          owner: 'James Wilson',
          action: 'Complete outstanding LMS modules using home study time as interim solution.',
          due: '2026-02-28'
        }
      ],
      overall_rating: {
        rag: 'Red',
        qualitative: 'Significant concerns regarding workplace support and off-the-job training provision. Immediate intervention required.',
        average_rating: 2.3,
        professional_judgement: 'Session effectively identified serious barriers to learner progress. Coach handled situation professionally and established clear escalation pathway. Urgent follow-up required with employer and programme management team.'
      },
      qa: [
        {
          metric: 'Duration',
          result: 'Appropriate duration given complexity of issues discussed.',
          rating_1_to_5: 5,
          rag: 'Green',
          notes: 'Coach allowed sufficient time for learner to express concerns and develop action plan.',
          evidence: []
        },
        {
          metric: 'Welcome Student',
          result: 'Coach created safe space for learner to share concerns.',
          rating_1_to_5: 5,
          rag: 'Green',
          notes: 'Excellent rapport and trust evident in learner openness.',
          evidence: []
        },
        {
          metric: 'Presentation',
          result: 'Session adapted appropriately to address learner concerns.',
          rating_1_to_5: 4,
          rag: 'Green',
          notes: 'Coach demonstrated flexibility in responding to learner needs.',
          evidence: []
        },
        {
          metric: 'KSB Evidence',
          result: 'Limited progress on KSB evidence due to workplace barriers.',
          rating_1_to_5: 1,
          rag: 'Red',
          notes: 'Learner unable to gather evidence due to lack of workplace support and training time.',
          evidence: []
        },
        {
          metric: 'Safeguarding',
          result: 'Safeguarding concern identified and escalation initiated.',
          rating_1_to_5: 5,
          rag: 'Amber',
          notes: 'Coach correctly identified potential safeguarding issue and followed appropriate procedures.',
          evidence: []
        }
      ]
    }
  },
  {
    id: 8,
    booking_id: 'BK-2026-008',
    status: 'failed',
    error: 'Invalid JSON in summary_json field: unexpected token at line 45',
    model: 'gpt-4o-mini',
    prompt_version: 'v2.2',
    input_chars: 14200,
    output_chars: 3200,
    created_at: '2026-02-19T14:00:00Z',
    summary_text: null,
    report_html: null,
    summary_json: null
  }
];
import Column from '@/resume/Column';
import Entry from '@/resume/Entry';
import Grid from '@/resume/Grid';
import Header from '@/resume/Header';
import Image from '@/resume/Image';
import MarkdownText from '@/resume/Markdown';
import Section from '@/resume/Section';
import type { BasicResumeNode } from '@/types';
import portraitUrl from './assets/maya-patel.webp?inline';

function markdown(value: string, htmlId?: string): BasicResumeNode {
  return {
    type: MarkdownText.type,
    value,
    ...(htmlId ? { htmlId } : {})
  };
}

function entry(
  title: string,
  subtitle: string[],
  bullets: string[] = []
): BasicResumeNode {
  return {
    type: Entry.type,
    title: [title],
    subtitle,
    childNodes: bullets.length ? [markdown(bullets.map((bullet) => `- ${bullet}`).join('\n'))] : []
  } as BasicResumeNode;
}

function section(value: string, childNodes: BasicResumeNode[]): BasicResumeNode {
  return { type: Section.type, value, childNodes };
}

/** Authors Integrity’s professional example using the same layout as its original sample. */
export function integrityProfessionalNodes(): BasicResumeNode[] {
  const sidebar: BasicResumeNode = {
    type: Column.type,
    htmlId: 'sidebar',
    childNodes: [
      {
        type: Image.type,
        htmlId: 'headshot',
        value: portraitUrl,
        altText: 'Portrait of fictional candidate Maya Patel'
      } as BasicResumeNode,
      section('Contact', [
        markdown([
          'Phoenix, AZ',
          '(602) 555-0147',
          'maya.patel@mail.example',
          'linkedin.com/in/maya-patel-example'
        ].join('\n\n'))
      ]),
      section('Expertise', [
        markdown([
          'Product operations',
          'Portfolio planning',
          'Launch readiness',
          'Process design',
          'Executive reporting',
          'Change management'
        ].map((skill) => `- ${skill}`).join('\n'))
      ]),
      section('Tools', [
        markdown('Jira · Linear · Notion\n\nLooker · SQL · Airtable')
      ])
    ]
  };

  const experience: BasicResumeNode = {
    type: Grid.type,
    childNodes: [
      markdown('2021 — Present'),
      entry('Northstar Health', ['Director, Product Operations', 'Phoenix, AZ'], [
        'Built a planning system for 11 product teams, reducing priority conflicts by 34%.',
        'Introduced launch-readiness reviews that shortened release handoffs by two weeks.',
        'Created executive reporting that connected delivery milestones to customer outcomes.'
      ]),
      markdown('2017 — 2021'),
      entry('Meridian Systems', ['Senior Program Manager', 'Remote'], [
        'Led 18 cross-functional initiatives spanning product, engineering, and customer success.',
        'Reduced enterprise onboarding time from three weeks to four days.'
      ]),
      markdown('2013 — 2017'),
      entry('SignalWorks', ['Product Operations Manager', 'Tempe, AZ'], [
        'Designed repeatable discovery and launch workflows for a growing software portfolio.',
        'Improved quarterly planning accuracy while reducing manual status reporting.'
      ])
    ]
  };

  const main: BasicResumeNode = {
    type: Column.type,
    htmlId: 'main-column',
    childNodes: [
      {
        type: Header.type,
        value: 'Maya Patel',
        distribution: 'top-to-bottom',
        justifyContent: 'center',
        subtitle: 'Product Operations Leader',
        childNodes: []
      } as BasicResumeNode,
      section('Experience', [experience]),
      section('Education', [
        {
          type: Grid.type,
          childNodes: [
            markdown('2013'),
            entry('Arizona State University', ['B.S. Business Data Analytics'])
          ]
        }
      ]),
      section('Certification', [
        entry('Project Management Professional', ['Project Management Institute', '2020'])
      ])
    ]
  };

  return [sidebar, main];
}

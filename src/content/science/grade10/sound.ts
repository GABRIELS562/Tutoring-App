import type { TopicContent } from '@/types'

export const soundGr10: TopicContent = {
  id: 'sound-gr10',
  slug: 'sound-gr10',
  subject: 'science',
  grade: 10,
  paper: 1,
  title: 'Sound',
  capsWeight: 10,
  sections: [
    {
      id: 'coming-soon',
      title: 'Sound',
      blocks: [
        {
          type: 'theory',
          title: 'Full Notes Coming Soon',
          body: `Full notes for this topic are coming soon. In the meantime, watch the Mindset Learn video below.

This topic covers:
• **Longitudinal Waves** - Compressions and rarefactions
• **Sound Production** - Vibrating objects creating sound
• **Sound Propagation** - Requires a medium (solid, liquid, gas)
• **Speed of Sound** - Different in different media
• **Pitch and Frequency** - Higher frequency = higher pitch
• **Loudness and Amplitude** - Greater amplitude = louder sound
• **Ultrasound** - Applications in medicine and industry`
        },
        {
          type: 'video',
          title: 'Watch: Sound — Mindset Learn',
          videoId: 'MINDSET_SOUND_GR10'
        }
      ]
    }
  ]
}

export default soundGr10

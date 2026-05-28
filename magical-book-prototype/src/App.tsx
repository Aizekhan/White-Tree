import { LivingBook } from './components/LivingBook';
import './App.css';

// Demo data - "The Last Signal" story
const demoSpreads = [
  {
    id: 'spread-1',
    leftPage: {
      type: 'lore' as const,
      title: 'World Context',
      content: [
        'In the year 2157, humanity reached beyond the stars, establishing colonies across the solar system.',
        'Communication between worlds relied on quantum relay stations—ancient, mysterious structures that predated human discovery.',
        'When the relays began to fail, silence fell across the void, isolating each colony in the darkness of space.'
      ]
    },
    rightPage: {
      type: 'chapter' as const,
      title: 'Chapter One: The Last Signal',
      content: [
        'Commander Elena Vasquez stood before the dying console, watching the last flicker of light fade from the quantum relay display.',
        'For three weeks, the station had been silent. No messages from Earth. No contact with Mars Colony. Nothing but the endless void.',
        '"Commander," her second officer, Kai, spoke quietly from the doorway. "We\'re picking up something. It\'s faint, but it\'s there."'
      ]
    },
    mood: 'dark'
  },
  {
    id: 'spread-2',
    leftPage: {
      type: 'context' as const,
      title: 'Character Notes',
      content: [
        'Elena Vasquez: Former military officer, now station commander. Haunted by the loss of her crew during the relay failures.',
        'Kai Chen: Communications specialist. Brilliant but inexperienced. Believes the relays are not broken, but listening.',
        'The signal they detected is unlike anything in human records—older, more complex, and growing stronger.'
      ]
    },
    rightPage: {
      type: 'narrative' as const,
      content: [
        'Elena\'s heart raced as she crossed the command deck. The signal analyzer displayed patterns she had never seen—fractal geometries that seemed to shift and breathe.',
        '"This isn\'t human," Kai whispered, his voice trembling with excitement and fear. "Commander, I think... I think something is trying to talk to us."',
        'The lights dimmed. The relay hummed to life. And in that moment, Elena realized they were no longer alone in the darkness.'
      ]
    },
    mood: 'epic'
  },
  {
    id: 'spread-3',
    leftPage: {
      type: 'suggestions' as const,
      title: 'Story Threads',
      content: [
        'The signal originates from beyond known space, suggesting an intelligence that predates humanity.',
        'Elena must choose: report the discovery to Earth (if contact is restored) or investigate alone.',
        'Kai\'s obsession with the signal grows—he begins to understand its language, but at what cost?'
      ]
    },
    rightPage: {
      type: 'narrative' as const,
      content: [
        'Over the following days, the signal evolved. What began as chaotic noise resolved into patterns, then structures, then something that resembled language.',
        'Kai stopped sleeping. He filled the walls with equations, diagrams, translations. "They\'re not trying to talk to us," he said one night, his eyes wide. "They\'re showing us how to listen."',
        'Elena watched the young officer with growing concern. The signal had changed him. And deep down, she feared it was changing her too.'
      ]
    },
    mood: 'dark'
  }
];

function App() {
  const handleGenerate = () => {
    console.log('[RITUAL] AI generation sequence initiated...');
    // TODO: Connect to real AI generation
  };

  return (
    <div
      className="min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: 'url(/images/backgrounds/back.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Living Book */}
      <div className="relative z-10">
        <LivingBook spreads={demoSpreads} onGenerate={handleGenerate} />
      </div>
    </div>
  );
}

export default App;

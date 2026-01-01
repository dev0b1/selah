export interface Prayer {
  id: string;
  title: string;
  category: 'morning' | 'evening' | 'gratitude' | 'peace' | 'strength' | 'guidance';
  duration: string;
  text: string;
}

export const prayers: Prayer[] = [
  {
    id: 'morning-blessing',
    title: 'Morning Blessing',
    category: 'morning',
    duration: '2 min',
    text: `Dear Lord, as {name} begins this new day, I ask for your blessing upon their journey.

May the light of your love guide {name}'s steps today.

Fill {name}'s heart with peace and their mind with clarity.

Grant {name} the strength to face whatever challenges may come, and the wisdom to see opportunities in every moment.

May {name} be a blessing to others today, reflecting your love in all their actions.

Thank you, Lord, for the gift of this new day. Amen.`,
  },
  {
    id: 'evening-peace',
    title: 'Evening Peace',
    category: 'evening',
    duration: '2 min',
    text: `Heavenly Father, as the day draws to a close, I lift up {name} to you.

Thank you for watching over {name} throughout this day.

Release any worries or burdens that {name} may be carrying. Let them rest in the assurance of your unfailing love.

Grant {name} peaceful sleep and sweet dreams.

May {name} awaken refreshed and renewed, ready to embrace tomorrow with hope and joy.

Wrap {name} in your loving arms tonight. Amen.`,
  },
  {
    id: 'gratitude-heart',
    title: 'Grateful Heart',
    category: 'gratitude',
    duration: '2 min',
    text: `Lord of all blessings, {name} comes before you with a grateful heart.

Thank you for the countless gifts you have bestowed upon {name}.

For the breath in their lungs, the love in their heart, and the hope in their soul.

Help {name} to recognize your blessings in both the grand moments and the simple joys.

May gratitude overflow from {name}'s heart today and always.

Teach {name} to live each moment with thankfulness. Amen.`,
  },
  {
    id: 'inner-peace',
    title: 'Inner Peace',
    category: 'peace',
    duration: '3 min',
    text: `Prince of Peace, {name} seeks your calming presence.

In the midst of life's storms, be {name}'s anchor.

Quiet the anxious thoughts that trouble {name}'s mind. Still the worries that disturb {name}'s heart.

Replace fear with faith, anxiety with assurance, and chaos with calm.

Let your peace, which surpasses all understanding, guard {name}'s heart and mind.

Help {name} to trust in your perfect plan. May {name} find rest in your presence.

Fill {name} with a deep, abiding peace that the world cannot take away. Amen.`,
  },
  {
    id: 'daily-strength',
    title: 'Daily Strength',
    category: 'strength',
    duration: '2 min',
    text: `Almighty God, source of all strength, {name} needs your power today.

When {name} feels weak, be their strength. When {name} feels tired, be their rest.

Grant {name} courage to face difficult conversations, patience with challenging situations, and resilience in moments of doubt.

Remind {name} that they can do all things through you who gives them strength.

May {name} draw upon your infinite power and find the fortitude to persevere.

Strengthen {name}'s spirit, renew their energy, and fill them with holy determination. Amen.`,
  },
  {
    id: 'divine-guidance',
    title: 'Divine Guidance',
    category: 'guidance',
    duration: '3 min',
    text: `Wise and loving Father, {name} seeks your guidance.

Illuminate the path before {name}. Make clear the decisions that need to be made.

When {name} comes to a crossroads, show them the way. When they face uncertainty, grant them clarity.

Help {name} to hear your still, small voice amidst the noise of life.

Give {name} discernment to distinguish your will from their own desires.

Lead {name} in paths of righteousness for your name's sake.

May {name}'s steps be ordered by you, and may they find joy in following where you lead.

Grant {name} the humility to seek your counsel and the faith to trust your direction. Amen.`,
  },
];

export const categories = [
  { id: 'morning', name: 'Morning', icon: '🌅' },
  { id: 'evening', name: 'Evening', icon: '🌙' },
  { id: 'gratitude', name: 'Gratitude', icon: '🙏' },
  { id: 'peace', name: 'Peace', icon: '🕊️' },
  { id: 'strength', name: 'Strength', icon: '💪' },
  { id: 'guidance', name: 'Guidance', icon: '✨' },
];


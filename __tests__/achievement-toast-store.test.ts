import { useAchievementToastStore } from '@/stores/achievement-toast-store';

describe('achievement-toast-store', () => {
  beforeEach(() => {
    useAchievementToastStore.setState({ queue: [] });
  });

  it('should enqueue achievement IDs and map to toast items', () => {
    useAchievementToastStore.getState().enqueue(['first_log', 'streak_3']);

    const { queue } = useAchievementToastStore.getState();
    expect(queue).toHaveLength(2);
    expect(queue[0]).toMatchObject({
      achievementId: 'first_log',
      emoji: '🎯',
      name: 'Primer Paso',
      xpAmount: 100,
    });
    expect(queue[1]).toMatchObject({
      achievementId: 'streak_3',
      emoji: '🔥',
      name: 'En Racha',
      xpAmount: 100,
    });
    expect(queue[0].id).toBeDefined();
    expect(queue[0].id).toContain('first_log');
  });

  it('should dequeue and remove first item', () => {
    useAchievementToastStore.getState().enqueue(['first_log', 'streak_3']);
    useAchievementToastStore.getState().dequeue();

    const { queue } = useAchievementToastStore.getState();
    expect(queue).toHaveLength(1);
    expect(queue[0].achievementId).toBe('streak_3');
  });

  it('should process queue FIFO', () => {
    useAchievementToastStore.getState().enqueue(['first_log']);
    useAchievementToastStore.getState().enqueue(['streak_3', 'streak_7']);

    const { queue } = useAchievementToastStore.getState();
    expect(queue).toHaveLength(3);
    expect(queue[0].achievementId).toBe('first_log');
    expect(queue[1].achievementId).toBe('streak_3');
    expect(queue[2].achievementId).toBe('streak_7');

    useAchievementToastStore.getState().dequeue();
    expect(useAchievementToastStore.getState().queue[0].achievementId).toBe('streak_3');
  });

  it('should return null from getCurrentItem when queue is empty', () => {
    expect(useAchievementToastStore.getState().getCurrentItem()).toBeNull();
  });

  it('should return first item from getCurrentItem when queue has items', () => {
    useAchievementToastStore.getState().enqueue(['first_log']);
    const item = useAchievementToastStore.getState().getCurrentItem();
    expect(item).not.toBeNull();
    expect(item?.achievementId).toBe('first_log');
    expect(item?.emoji).toBe('🎯');
  });

  it('should not enqueue when given empty array', () => {
    useAchievementToastStore.getState().enqueue([]);
    expect(useAchievementToastStore.getState().queue).toHaveLength(0);
  });

  it('should filter out unknown achievement IDs', () => {
    useAchievementToastStore.getState().enqueue(['first_log', 'unknown_id', 'streak_3']);
    const { queue } = useAchievementToastStore.getState();
    expect(queue).toHaveLength(2);
    expect(queue[0].achievementId).toBe('first_log');
    expect(queue[1].achievementId).toBe('streak_3');
  });
});

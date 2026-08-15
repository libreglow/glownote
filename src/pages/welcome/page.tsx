import { Button } from '../../components/ui/button';
import { ShimmerTextFlip } from '../../components/grootstudio/shimmer-text-flip';
import { motion } from 'motion/react';
import {
  CenterMorphModal,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from '../../components/motion/center-morph-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/motion/select';
import { useEffect, useState } from 'react';
import { ThemeSwitcher } from '../../components/optics/theme-switcher';
import {
  getPreferences,
  savePreferences,
  type Direction,
} from '../../storage/settings';
import { useNavigation } from '../../store/navigation-store';

const text = [
  'Think Clearly.',
  'Write Freely.',
  'Stay Organized.',
  'Build Your Knowledge.',
];

type Theme = 'system' | 'light' | 'dark';

export default function Welcome() {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [theme, setTheme] = useState<Theme>('system');

  const navigate = useNavigation((state) => state.navigate);

  const [preferences, setPreferences] = useState(getPreferences());

  const updatePreference = <K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K],
  ) => {
    const updated = {
      ...preferences,
      [key]: value,
    };

    setPreferences(updated);
    savePreferences(updated);
    setDirection(updated.direction);
  };

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      return;
    }

    if (theme === 'light') {
      root.classList.remove('dark');
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const updateSystemTheme = () => {
      root.classList.toggle('dark', media.matches);
    };

    updateSystemTheme();

    media.addEventListener('change', updateSystemTheme);

    return () => {
      media.removeEventListener('change', updateSystemTheme);
    };
  }, [theme]);

  return (
    <div
      dir={direction}
      className="relative min-h-screen w-full overflow-hidden bg-background text-foreground transition-colors"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.16) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-background/65 backdrop-blur-[1px]"
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6">
        <div className="flex max-w-5xl flex-col items-center text-center">
          <ShimmerTextFlip
            interval={2.5}
            as={motion.span}
            className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl"
          >
            {text}
          </ShimmerTextFlip>

          <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            A simple space to capture your ideas, organize your thoughts, and
            build your personal knowledge.
          </p>

          <div className="mt-8 flex w-full items-center justify-center">
            <CenterMorphModal>
              <CenterMorphModalTrigger>
                <Button className="h-11 rounded-full px-6">
                  Getting Started
                </Button>
              </CenterMorphModalTrigger>

              <CenterMorphModalContent
                ariaLabel="GlowNote personalization"
                ariaDescribedBy="glownote-personalization-description"
              >
                <div className="p-7 sm:p-8">
                  <p className="text-sm font-medium text-muted-foreground">
                    glownote
                  </p>

                  <h2 className="mt-5 max-w-xs text-2xl font-medium tracking-tight text-foreground">
                    Personalize your experience
                  </h2>

                  <p
                    id="glownote-personalization-description"
                    className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    Welcome. Before you start, customize GlowNote to suit your
                    preferences. You can change these settings anytime later.
                  </p>

                  <div className="mt-7 space-y-5 border-y border-border py-5">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Direction
                      </p>

                      <Select
                        value={direction}
                        onValueChange={(value) =>
                          updatePreference('direction', value as Direction)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose direction" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="ltr">LTR</SelectItem>
                          <SelectItem value="rtl">RTL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Theme
                      </p>

                      <ThemeSwitcher
                        value={theme}
                        onChange={(value) => setTheme(value as Theme)}
                      />
                    </div>
                  </div>

                  <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                    Your preferences will be saved locally on this device.
                  </p>

                  <Button
                    onClick={() => {
                      navigate({
                        name: 'home',
                      });
                    }}
                    className="mt-7 h-11 w-full rounded-full"
                  >
                    Continue
                  </Button>
                </div>
              </CenterMorphModalContent>
            </CenterMorphModal>
          </div>
        </div>
      </div>
    </div>
  );
}

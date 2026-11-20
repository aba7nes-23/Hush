import { AudioLines, ArrowRight, PhoneOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Row, Stack } from '../parts';

export function ButtonDemo() {
  return (
    <div className="space-y-8">
      <Stack label="Variants">
        <Row>
          <Button><AudioLines aria-hidden="true" /> Primary</Button>
          <Button variant="quiet">Quiet</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive"><PhoneOff aria-hidden="true" /> End call</Button>
          <Button variant="ghost">Ghost</Button>
        </Row>
      </Stack>
      <Stack label="Sizes and icon controls">
        <Row>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Continue"><ArrowRight aria-hidden="true" /></Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Stack>
      <Stack label="As a link">
        <Row>
          <Button asChild variant="quiet">
            <a href="#overview">Back to overview <ArrowRight aria-hidden="true" /></a>
          </Button>
        </Row>
      </Stack>
    </div>
  );
}

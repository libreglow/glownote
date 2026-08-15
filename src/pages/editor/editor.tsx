import { MacOSSidebar } from '../../components/ui/sidebar';

const DEMO_ITEMS = ['Canvas 1', 'Canvas 2', 'Canvas 3', 'Canvas 4', 'Canvas 5'];

export default function Editor({ id }: { id: string }) {
  return (
    <div className=" h-[90%] w-full mt-10">
      <MacOSSidebar items={DEMO_ITEMS} className="h-[90%] w-full">
        ة{id}
      </MacOSSidebar>
    </div>
  );
}

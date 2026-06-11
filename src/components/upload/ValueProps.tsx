import { Icon, type IconName } from "@/components/ui/Icon";

interface ValueProp {
  icon: IconName;
  title: string;
  desc: string;
}

const VALUE_PROPS: ValueProp[] = [
  { icon: "layers", title: "複数画像を一括処理", desc: "何十枚でもまとめてリサイズ" },
  { icon: "crop", title: "Cover / Contain / Stretch", desc: "枠への収め方を選ぶだけ" },
  { icon: "image", title: "四角・角丸・円・楕円", desc: "用途に合わせたマスク" },
  { icon: "zip", title: "ZIPで一括ダウンロード", desc: "1クリックでまとめて保存" },
];

/** 価値訴求カード 4 枚（仕様書 §5.1） */
export function ValueProps() {
  return (
    <div className="mb-[30px] grid grid-cols-4 gap-3">
      {VALUE_PROPS.map((v) => (
        <div
          key={v.title}
          className="rounded-md border border-border bg-surface p-4 pb-[17px] shadow-xs"
        >
          <div className="mb-[11px] grid h-9 w-9 place-items-center rounded-[9px] bg-accent-weak text-accent">
            <Icon name={v.icon} size={18} />
          </div>
          <div className="text-[13.5px] font-bold leading-[1.35] text-text">{v.title}</div>
          <div className="mt-[3px] text-[12.5px] text-text-3">{v.desc}</div>
        </div>
      ))}
    </div>
  );
}

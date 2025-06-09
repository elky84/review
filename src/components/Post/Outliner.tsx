import { Heading } from "./types";

export const Outliner: React.FC<{ headings: Heading[] }> = ({ headings }) => {
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // 헤더 높이만큼 조절 (필요시 변경)
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });

      // URL hash 업데이트도 원하면 포함 가능
      window.history.pushState(null, '', `#${id}`);
    }
    else {
      console.log(id);
    }
  };


  return (
    <nav style={{ position: 'fixed', right: 0, top: 100, width: '250px', padding: '1rem', borderLeft: '1px solid #ccc' }}>
      <h3>📑 Outline</h3>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id} style={{ marginLeft: (heading.level - 1) * 12 }}>
            <button
              onClick={() => handleClick(heading.id)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

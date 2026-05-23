import Section from '@ui/Section';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Section title="Página não encontrada">
      <p className="mb-4">A página que você tentou acessar não existe.</p>
      <Link to="/" className="text-accent hover:underline">Voltar para Home</Link>
    </Section>
  );
}

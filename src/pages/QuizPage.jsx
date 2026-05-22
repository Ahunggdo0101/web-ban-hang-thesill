import PlantQuiz from '../components/PlantQuiz';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function QuizPage() {
  useDocumentTitle('Trắc Nghiệm Cây Xanh');
  return (
    <PlantQuiz />
  );
}

import axios from 'axios';

export const callLambdaFunction = async (content) => {
  if (!process.env.NEXT_PUBLIC_LAMBDA_URL) {
      throw new Error('Lambda URL이 설정되지 않았습니다');
  }

  try {
      const response = await axios.post(process.env.NEXT_PUBLIC_LAMBDA_URL, { content });
      console.log(response);
      return response.data;
  } catch (error) {
      console.error('Lambda 호출 중 오류:', error);
      throw new Error('AI 서비스 호출 실패');
  }
};
'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Card, { CardContent, CardHeader, CardTitle } from './Card';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useApplyDiscountCode } from '../../lib/hooks/useDiscountCode';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../lib/utils/errorExtractor';

interface ApplyDiscountCodeProps {
  businessId: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function ApplyDiscountCode({
  businessId,
  onSuccess,
  onError,
  className = ''
}: ApplyDiscountCodeProps) {
  const [code, setCode] = useState('');

  const { applyDiscountCode, isLoading, error } = useApplyDiscountCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('İndirim kodu giriniz');
      return;
    }

    try {
      const response = await applyDiscountCode(businessId, code.trim().toUpperCase());
      
      if (response.success) {
        toast.success('İndirim kodu başarıyla uygulandı!');
        setCode('');
        onSuccess?.('İndirim kodu başarıyla uygulandı!');
      } else {
        toast.error(response.error || 'İndirim kodu uygulanamadı');
        onError?.(response.error || 'İndirim kodu uygulanamadı');
      }
    } catch (error: unknown) {
      // Use backend's translated error message if available
      const errorMessage = extractErrorMessage(error, 'İndirim kodu uygulanamadı');
      toast.error(errorMessage);
      onError?.(errorMessage);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">İndirim Kodu Uygula</CardTitle>
        <p className="text-sm text-gray-600">
          Mevcut aboneliğinize indirim kodu uygulayabilirsiniz. İndirim bir sonraki ödeme döneminde geçerli olacaktır.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="discount-code" className="text-sm font-medium text-gray-700">
              İndirim Kodu
            </label>
            <div className="flex space-x-2">
              <Input
                id="discount-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="İndirim kodunuzu girin"
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!code.trim() || isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Uygula'
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">İndirim Kodu Hakkında:</p>
              <ul className="space-y-1 text-xs">
                <li>• İndirim kodu bir sonraki ödeme döneminde geçerli olur</li>
                <li>• Tekrarlayan indirimler tüm yenileme dönemlerinde uygulanır</li>
                <li>• Tek seferlik indirimler sadece bir kez uygulanır</li>
                <li>• İndirim kodu geçerlilik süresi ve kullanım limitleri vardır</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

CREATE POLICY "Allow admin to delete receipts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'receipts' AND auth.uid() = '3e7839a4-2d42-430d-989d-38f5e8fe5398');

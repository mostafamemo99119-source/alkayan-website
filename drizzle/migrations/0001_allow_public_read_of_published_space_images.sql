CREATE POLICY "Visitors can read published space images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'space-images'
  AND EXISTS (
    SELECT 1
    FROM public.space_images si
    JOIN public.spaces s ON s.id = si.space_id
    WHERE si.storage_path = name AND s.is_active = true
  )
);
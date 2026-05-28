const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      let receiptUrl: string | null = null;
      // [Logica upload invariata...]
      if (paymentMethod === 'promptpay' && receiptFile) {
        const ext = receiptFile.name.split('.').pop() ?? 'jpg';
        const fileName = `receipt-${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile, { contentType: receiptFile.type });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(uploadData.path);
        receiptUrl = urlData.publicUrl;
      }

      const savedItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        itemTotal: calcItemTotal(item),
      }));

      const order = {
        customer_name: name.trim() || 'Cliente',
        phone: phone.trim() || '000000',
        address: address.trim() || 'Nessun indirizzo',
        items: savedItems,
        total: total,
        status: 'new',
        payment_method: paymentMethod, // Invio diretto senza forzature
        receipt_url: receiptUrl,
        telegram_notified: false,
      };

      // PROVA DI SCRITTURA FORZATA
      const { data, error: dbError } = await supabase.from('pizza_orders').insert([order]);
      
      // Se dbError esiste, NON blocchiamo l'esecuzione con throw
      if (dbError) {
        console.error("ERRORE DATABASE (ma continuiamo):", dbError);
        // Continuiamo comunque per vedere se almeno Telegram riceve il messaggio
      }

      await sendTelegramNotification({ ...order, receipt_url: receiptUrl } as any);

      clearCart();
      setStep(3);
    } catch (err: any) {
      console.error("ERRORE CRITICO:", err);
      setError("Qualcosa è andato storto, ma l'ordine potrebbe essere partito.");
    } finally {
      setLoading(false);
    }
  };
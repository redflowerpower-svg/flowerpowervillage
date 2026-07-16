-- Enable Supabase Realtime for the pizza_orders table
-- (Note: If it already exists, this command may show a warning or be a no-op, which is expected)
ALTER PUBLICATION supabase_realtime ADD TABLE pizza_orders;

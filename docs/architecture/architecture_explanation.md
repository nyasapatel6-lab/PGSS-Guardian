# PGSS Architecture

PGSS is an AI-powered wearable safety system.

1. MPU6050 collects motion data.
2. ESP32 processes sensor readings.
3. CNN model detects falls locally.
4. GPS captures location.
5. Data is sent to Supabase.
6. Mobile app receives updates.
7. Guardian receives emergency information.

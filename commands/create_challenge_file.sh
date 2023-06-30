#!/bin/bash

# Variables
well_known_dir="~/dm-dash/public/.well-known/acme-challenge"

# Function to create the challenge file
create_challenge_file() {
    local token="$1"
    local key_auth="$2"
    local challenge_file="$well_known_dir/$token"
    
    echo "$key_auth" > "$challenge_file"
    
    # Add logic here to handle permissions or file ownership if necessary
    # For example: chmod 644 "$challenge_file"
}

# Function to remove the challenge file
remove_challenge_file() {
    local token="$1"
    local challenge_file="$well_known_dir/$token"
    
    rm "$challenge_file"
}

# Main logic
case "$CERTBOT_AUTH_DOMAIN" in
    "yourdomain.com")
        # Create challenge file
        create_challenge_file "$CERTBOT_TOKEN" "$CERTBOT_KEY_AUTH"
        ;;
    *)
        echo "Error: Unknown domain for authentication"
        exit 1
        ;;
esac

# Wait for file propagation
echo "Waiting for file propagation..."
sleep 10

# Verify file existence and content
challenge_file="$well_known_dir/$CERTBOT_TOKEN"
if [[ -f "$challenge_file" && "$(cat "$challenge_file")" == "$CERTBOT_KEY_AUTH" ]]; then
    echo "File verification successful!"
else
    echo "File verification failed. Please check the challenge file."
    exit 1
fi

# Clean up: Remove challenge file
# Uncomment the following line if you want to remove the challenge file after verification
# remove_challenge_file "$CERTBOT_TOKEN"

exit 0

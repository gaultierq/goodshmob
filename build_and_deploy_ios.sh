
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

bitrise run -c $DIR/bitrise.local.yml --workflow "ios"
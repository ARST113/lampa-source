import importlib.util
from pathlib import Path
import unittest

MODULE = Path(__file__).parents[1] / 'scripts' / 'lab' / 'watchdog.py'


class WatchdogDecisionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location('lab_watchdog', MODULE)
        cls.mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.mod)

    def test_available_and_healthy_keeps_alive_without_restart(self):
        self.assertEqual(self.mod.decide('Available', True), 'keepalive')

    def test_available_but_unhealthy_repairs_runtime(self):
        self.assertEqual(self.mod.decide('Available', False), 'repair')

    def test_stopped_starts_codespace(self):
        self.assertEqual(self.mod.decide('Stopped', False), 'start')
        self.assertEqual(self.mod.decide('Shutdown', False), 'start')

    def test_transitioning_waits(self):
        self.assertEqual(self.mod.decide('Starting', False), 'wait')


if __name__ == '__main__':
    unittest.main()
